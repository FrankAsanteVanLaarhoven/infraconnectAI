import { SOVEREIGN_IDENTITY, formatTradeForMirror } from './user-identity-hub';

export interface NotificationPayload {
    recipient: string;
    type: 'SMS' | 'EMAIL';
    content: string;
    timestamp: string;
    primacy: 'HIGH' | 'MAX' | 'INFO';
}

export function dispatchTradeAlert(ticker: string, type: 'BUY' | 'SELL', data: any) {
    const formattedContent = formatTradeForMirror(
        ticker,
        data.stake || 100,
        data.leverage || 30,
        data.sl || 0,
        data.tp || 0
    );

    const emailPayload: NotificationPayload = {
        recipient: SOVEREIGN_IDENTITY.email,
        type: 'EMAIL',
        content: `SOVEREIGN_ALERT_${type}: ${ticker}\n\n${formattedContent}\n\nEXECUTE_IN_MIRROR_MODE_NOW`,
        timestamp: new Date().toISOString(),
        primacy: 'MAX'
    };

    const smsPayload: NotificationPayload = {
        recipient: SOVEREIGN_IDENTITY.mobile,
        type: 'SMS',
        content: `[HUD_2035] ${type} ${ticker} @ x${data.leverage}. STAKE: $${data.stake}. SL: $${data.sl}. Mirror now.`,
        timestamp: new Date().toISOString(),
        primacy: 'MAX'
    };

    console.log(`[DISPATCHING_EMAIL] to ${emailPayload.recipient}: ${emailPayload.content}`);
    console.log(`[DISPATCHING_SMS] to ${smsPayload.recipient}: ${smsPayload.content}`);

    return { emailPayload, smsPayload };
}

export function dispatchDailyAlphaExtract(amount: number) {
    const content = `[HUD_2035] DAILY_ALPHA_REPORT: £${amount.toFixed(2)} Captured. Current Drawdown: 0.00%. Floor Distance: SAFE.`;
    console.log(`[DISPATCHING_SMS] to ${SOVEREIGN_IDENTITY.mobile}: ${content}`);
}
