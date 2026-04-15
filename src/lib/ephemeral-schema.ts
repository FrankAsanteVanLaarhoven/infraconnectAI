// src/lib/ephemeral-schema.ts

export type EphemeralWidgetType = 'metric' | 'chart' | 'table' | 'text' | 'list';

export interface EphemeralWidget {
  id: string;
  type: EphemeralWidgetType;
  title: string;
  data: any; // Varies based on type
  color?: string; // e.g. "blue", "green", "red", "purple"
}

export interface EphemeralLayout {
  id: string;
  title: string;
  description?: string;
  widgets: EphemeralWidget[];
  intent: string;
  generatedAt: number;
}
