"use client";
type ENV = {
  VITE_QUEUE_API_PATH: string;
  VITE_ENV: 'development' | 'production';
};

const parseEnv = (): ENV => {
  const VITE_QUEUE_API_PATH = (import.meta as any).env.VITE_QUEUE_API_PATH;
  
  if (!VITE_QUEUE_API_PATH) {
    throw new Error("VITE_QUEUE_API_PATH is not defined");
  }

  return {
    VITE_QUEUE_API_PATH,
    VITE_ENV: (import.meta as any).env.DEV ? 'development' : 'production',
  };
};

export const env = parseEnv();
