import { eventBus } from "@/lib/events/schema";

export async function GET(req: Request) {
  // Set up Server-Sent Events headers
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // 1. Flush any cached recent events immediately upon connection
      for (const ev of eventBus.lastEvents) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
      }

      // 2. Subscribe to new live events
      const unsubscribe = eventBus.subscribe((event) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch (e) {
          // Stream likely closed by client
          unsubscribe();
        }
      });

      // Keep connection alive with heartbeat comments (ignored by EventSource)
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch (e) {
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 15000);

      // Handle client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
