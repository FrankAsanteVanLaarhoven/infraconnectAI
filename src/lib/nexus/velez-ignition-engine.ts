/**
 * 🐘 Velez Ignition Engine (v37)
 * High-Frequency Momentum & institutional Ignition Detection
 */

export interface VelezPattern {
    type: 'ELEPHANT_BAR' | '180_REVERSAL' | 'IGNITION_PULSE';
    ticker: string;
    intensity: number; // 0-100
    isExtended: boolean; // Far from 20 SMA
    entrySignal: number; // High/Low of the bar
    stopLoss: number;
}

/**
 * Detects institutional "Elephant Bars"
 */
export function detectElephantBar(ticker: string, size: number, wickPercentage: number, volume: number): VelezPattern | null {
    const isElephant = size > 1.8 && wickPercentage < 0.15; // Body > 1.8x ATR, wicks < 15%
    
    if (!isElephant) return null;

    return {
        type: 'ELEPHANT_BAR',
        ticker,
        intensity: Math.min(100, volume * 1.5),
        isExtended: false, // Needs SMA context
        entrySignal: 0, // Placeholder
        stopLoss: 0
    };
}

/**
 * Calibrates "The 8-Minute Pulse" confidence
 */
export function calculateVelezIntensity(patterns: VelezPattern[], sma20Dist: number): number {
    if (patterns.length === 0) return 0;
    
    const baseIntensity = patterns.reduce((acc, p) => acc + p.intensity, 0) / patterns.length;
    const proximityWeight = Math.max(0, 1 - (sma20Dist / 20)); // Stronger near 20 SMA
    
    return baseIntensity * proximityWeight;
}
