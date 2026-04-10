import { Server } from 'socket.io';

const PORT = 3004;

const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

interface AgentMessage {
  id: string;
  topic: string;
  sender: string;
  payload: Record<string, unknown>;
  timestamp: string;
  ttl?: number;
}

interface Subscription {
  socketId: string;
  topic: string;
  agentId: string;
}

const topics = new Map<string, Set<string>>();
const subscriptions: Subscription[] = [];
const messageHistory: AgentMessage[] = [];
const MAX_HISTORY = 200;

// Topic hierarchy: memory.*, skill.*, governance.*, agent.*
function topicMatch(pattern: string, topic: string): boolean {
  if (pattern === '#') return true;
  if (pattern.endsWith('.#')) return topic.startsWith(pattern.slice(0, -2));
  if (pattern.includes('+')) {
    const regex = new RegExp('^' + pattern.replace(/\+/g, '[^.]+') + '$');
    return regex.test(topic);
  }
  return pattern === topic;
}

function getSubscribers(topic: string): Set<string> {
  const subscribers = new Set<string>();
  subscriptions.forEach(sub => {
    if (topicMatch(sub.topic, topic)) {
      subscribers.add(sub.socketId);
    }
  });
  return subscribers;
}

io.on('connection', (socket) => {
  const agentId = socket.handshake.query.agentId as string || `agent-${socket.id.slice(0, 8)}`;
  console.log(`[AGENT-BUS] ${agentId} connected (${socket.id})`);

  // Send initial state
  socket.emit('connected', {
    agentId,
    socketId: socket.id,
    topics: Array.from(topics.keys()),
    activeSubscriptions: subscriptions.filter(s => s.socketId === socket.id).map(s => s.topic),
  });

  // Subscribe to topic(s)
  socket.on('subscribe', (topicsList: string | string[]) => {
    const list = Array.isArray(topicsList) ? topicsList : [topicsList];
    list.forEach(topic => {
      subscriptions.push({ socketId: socket.id, topic, agentId });
      if (!topics.has(topic)) topics.set(topic, new Set());
      topics.get(topic)!.add(socket.id);
      console.log(`[AGENT-BUS] ${agentId} → subscribed to ${topic}`);
    });
    socket.emit('subscribed', { topics: list });
  });

  // Unsubscribe from topic(s)
  socket.on('unsubscribe', (topicsList: string | string[]) => {
    const list = Array.isArray(topicsList) ? topicsList : [topicsList];
    list.forEach(topic => {
      const idx = subscriptions.findIndex(s => s.socketId === socket.id && s.topic === topic);
      if (idx !== -1) subscriptions.splice(idx, 1);
      topics.get(topic)?.delete(socket.id);
      console.log(`[AGENT-BUS] ${agentId} → unsubscribed from ${topic}`);
    });
    socket.emit('unsubscribed', { topics: list });
  });

  // Publish message
  socket.on('publish', (msg: { topic: string; payload: Record<string, unknown> }) => {
    const message: AgentMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      topic: msg.topic,
      sender: agentId,
      payload: msg.payload,
      timestamp: new Date().toISOString(),
    };

    // Store in history
    messageHistory.unshift(message);
    if (messageHistory.length > MAX_HISTORY) messageHistory.pop();

    // Broadcast to subscribers
    const subscribers = getSubscribers(msg.topic);
    subscribers.forEach(subId => {
      io.to(subId).emit('message', message);
    });

    console.log(`[AGENT-BUS] ${agentId} → ${msg.topic}: ${JSON.stringify(msg.payload).slice(0, 80)}`);
    socket.emit('published', { id: message.id });
  });

  // Request history
  socket.on('history', (filter: { topic?: string; limit?: number }) => {
    const limit = filter.limit ?? 50;
    const filtered = filter.topic
      ? messageHistory.filter(m => topicMatch(filter.topic!, m.topic))
      : [...messageHistory];
    socket.emit('history', filtered.slice(0, limit));
  });

  // Heartbeat
  socket.on('ping', () => {
    socket.emit('pong', { ts: Date.now() });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const toRemove = subscriptions.filter(s => s.socketId === socket.id);
    toRemove.forEach(sub => {
      topics.get(sub.topic)?.delete(socket.id);
    });
    const remaining = subscriptions.filter(s => s.socketId !== socket.id);
    subscriptions.length = 0;
    subscriptions.push(...remaining);
    console.log(`[AGENT-BUS] ${agentId} disconnected`);
  });
});

console.log(`[AGENT-BUS] Memory DevOps Agent Bus running on port ${PORT}`);
console.log(`[AGENT-BUS] Topics: memory.#, skill.#, governance.#, agent.#`);

// Periodic health broadcast
setInterval(() => {
  const healthMsg: AgentMessage = {
    id: `health-${Date.now()}`,
    topic: 'system.health',
    sender: 'agent-bus',
    payload: {
      uptime: process.uptime(),
      connections: io.engine.clientsCount,
      topics: topics.size,
      subscriptions: subscriptions.length,
      messageHistory: messageHistory.length,
    },
    timestamp: new Date().toISOString(),
  };
  const subs = getSubscribers('system.#');
  subs.forEach(id => io.to(id).emit('message', healthMsg));
}, 30000);
