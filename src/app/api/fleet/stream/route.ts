import { serverHub } from '@/lib/agent-ops/ServerHub';

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const onMessage = ({ event, data }: { event: string; data: any }) => {
        try {
          const payload = JSON.stringify(data);
          controller.enqueue(`event: ${event}\ndata: ${payload}\n\n`);
        } catch (e) {
          console.error('[SSE_STREAM_ERR] Failed to enqueue message', e);
        }
      };

      serverHub.on('message', onMessage);

      // Store cleanup for when the client disconnects
      (this as any).cleanup = () => {
        serverHub.off('message', onMessage);
      };
    },
    cancel() {
      if ((this as any).cleanup) (this as any).cleanup();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
