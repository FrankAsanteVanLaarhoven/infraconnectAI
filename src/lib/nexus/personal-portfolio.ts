export interface PortfolioStake {
    id: string;
    ticker: string;
    units: number;
    avgOpenPrice: number;
    currentPrice: number;
    plPercentage: number;
    type: 'LONG' | 'SHORT';
}

export interface UserRegistry {
    id: string;
    name: string;
    totalValueUsd: number;
    investedUsd: number;
    cashUsd: number;
    cashGbp: number;
    baseCurrency: 'GBP' | 'USD';
    holdings: PortfolioStake[];
    vault: string[]; // Long-term set-and-forget tickers
}

export const PERSONAL_PORTFOLIO: UserRegistry = {
    id: 'sovereign_frank_001',
    name: 'Frank Van Laarhoven',
    totalValueUsd: 330.00, // Based on eToro mirror
    investedUsd: 293.03,
    cashUsd: 8.96,
    cashGbp: 0.89, // approx 0.66 GBP from screen
    baseCurrency: 'GBP',
    holdings: [
        {
            id: 'h1',
            ticker: 'SNDK',
            units: 0.30551,
            avgOpenPrice: 876.23,
            currentPrice: 952.50,
            plPercentage: 17.32,
            type: 'LONG'
        },
        {
            id: 'h2',
            ticker: 'RCL',
            units: 0.24566,
            avgOpenPrice: 272.00,
            currentPrice: 281.81,
            plPercentage: 3.61,
            type: 'LONG'
        },
        {
            id: 'h3',
            ticker: 'NVDA',
            units: 0.32655,
            avgOpenPrice: 184.15,
            currentPrice: 188.84,
            plPercentage: 2.55,
            type: 'LONG'
        }
    ],
    vault: ['NVDA', 'MU', 'TSM', 'MP']
};

export function getSovereignStake() {
    return PERSONAL_PORTFOLIO;
}

export function calculateFeeImpact(amount: number, from: 'GBP' | 'USD', to: 'GBP' | 'USD') {
    // Simulated eToro 150 pip conversion fee
    const conversionRate = 1.25; // GBP/USD
    const feePercent = 0.0015; // 0.15% roughly
    return amount * feePercent;
}
