export interface SovereignContact {
    email: string;
    mobile: string;
    notificationPreferences: {
        buyAlerts: boolean;
        sellAlerts: boolean;
        dailyProfitReport: boolean;
        emergencyStopLoss: boolean;
    };
    preferredPlatform: 'ETORO' | 'IBKR' | 'TRADESTATION';
}

export const SOVEREIGN_IDENTITY: SovereignContact = {
    email: 'frankleroyvan@gmail.com',
    mobile: '07481872197',
    notificationPreferences: {
        buyAlerts: true,
        sellAlerts: true,
        dailyProfitReport: true,
        emergencyStopLoss: true
    },
    preferredPlatform: 'ETORO'
};

export function getSovereignContact() {
    return SOVEREIGN_IDENTITY;
}

export function formatTradeForMirror(ticker: string, stake: number, leverage: number, sl: number, tp: number) {
    return `TICKER: ${ticker}\nSTAKE: $${stake.toFixed(2)}\nLEVERAGE: x${leverage}\nSTOP_LOSS: $${sl.toFixed(2)}\nTAKE_PROFIT: $${tp.toFixed(2)}`;
}
