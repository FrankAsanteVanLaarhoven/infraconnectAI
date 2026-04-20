import { Kafka, Producer, Consumer } from 'kafkajs';

/**
 * Singleton Kafka Client for Next.js Backbone
 * 
 * NOTE: In development (Next.js HMR), this singleton pattern prevents
 * massive connection leakage to the Kafka cluster upon hot reloads.
 */
class KafkaBackbone {
  private static instance: KafkaBackbone;
  private kafka: Kafka;
  private producer: Producer | null = null;
  
  // Note: Consumers in Next.js Serverless routes are risky and should typically 
  // run in a persistent worker process. But we structure it here for the architecture map.
  private consumer: Consumer | null = null;

  private constructor() {
    this.kafka = new Kafka({
      clientId: 'infraconnect-control-plane',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });
  }

  public static getInstance(): KafkaBackbone {
    if (!KafkaBackbone.instance) {
      KafkaBackbone.instance = new KafkaBackbone();
    }
    return KafkaBackbone.instance;
  }

  public async getProducer(): Promise<Producer> {
    if (!this.producer) {
      this.producer = this.kafka.producer();
      await this.producer.connect();
      console.log('[KAFKA_BACKBONE] Producer Connected.');
    }
    return this.producer;
  }

  /**
   * Universal ingestion method mapping into the distributed fabric
   */
  public async produceEvent(topic: string, eventType: string, payload: any) {
    try {
      const producer = await this.getProducer();
      await producer.send({
        topic,
        messages: [
          { 
            key: eventType, 
            value: JSON.stringify({
               timestamp: Date.now(),
               payload
            }) 
          }
        ],
      });
    } catch (e) {
      console.error(`[KAFKA_BACKBONE] Failed to produce to topic ${topic} - `, e);
      // Fallback logic here if needed (e.g. write to local dead-letter-queue)
    }
  }
}

// Ensure global preservation during Next.js Hot Reloads
declare global {
  var _kafkaBackbone: KafkaBackbone | undefined;
}

export const kafkaClient = global._kafkaBackbone || KafkaBackbone.getInstance();

if (process.env.NODE_ENV !== 'production') {
  global._kafkaBackbone = kafkaClient;
}
