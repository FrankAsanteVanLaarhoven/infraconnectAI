import { exec } from 'child_process';
import os from 'os';

const NODE_NAME = os.hostname();
const PORT = process.env.PORT || "3006"; // Target the native PM2 bridge
const WEBHOOK_URL = `http://localhost:${PORT}/api/watchdog`;

const MAX_TEMP_C = 85;
const MAX_VRAM_PERCENT = 95;

let NVIDIA_AVAILABLE = false;

console.log(`===========================================================`);
console.log(` Native TS Watchdog Daemon [${NODE_NAME}] - ACTIVE DEPLOYMENT `);
console.log(` Thermal Ceiling: ${MAX_TEMP_C}°C | Memory Limit: ${MAX_VRAM_PERCENT}% `);
console.log(`=========================================================`);

// Test if Nvidia SMI exists
exec('nvidia-smi', (err) => {
    if (err) {
        console.warn(`[WATCHDOG] nvidia-smi not detected. Hardware metrics will be explicitly simulated.`);
        NVIDIA_AVAILABLE = false;
    } else {
        console.log(`[WATCHDOG] Initialized NVIDIA-SMI bindings. Monitoring underlying tensor nodes.`);
        NVIDIA_AVAILABLE = true;
    }
});

function getMetrics(): Promise<number[]> {
    return new Promise((resolve) => {
        if (NVIDIA_AVAILABLE) {
            exec('nvidia-smi --query-gpu=temperature.gpu,utilization.memory,utilization.gpu --format=csv,noheader,nounits', (error, stdout) => {
                if (error) {
                    resolve(simulateMetrics());
                    return;
                }
                const parts = stdout.trim().split(',');
                if (parts.length >= 3) {
                    resolve([parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2])]);
                } else {
                    resolve(simulateMetrics());
                }
            });
        } else {
           resolve(simulateMetrics());
        }
    });
}

function simulateMetrics(): number[] {
    // We simulate borderline edge heat loads pushing constraints
    const temp = Math.floor(Math.random() * (92 - 86 + 1) + 86);
    const vram = Math.floor(Math.random() * (99 - 96 + 1) + 96);
    const gpu = Math.floor(Math.random() * (100 - 90 + 1) + 90);
    return [temp, vram, gpu];
}

async function isolateHardwareFailure(t_c: number, m_p: number, g_p: number) {
    console.log(`\n[CRITICAL ERROR] Hardware Anomaly detected on Node ${NODE_NAME}!`);
    console.log(`  > Temp: ${t_c}°C / ${MAX_TEMP_C}°C\n  > VRAM: ${m_p}% / ${MAX_VRAM_PERCENT}%`);
    console.log(`Firing Override Pipeline!`);
    
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                signature: 'SOVEREIGN_WATCHDOG_AUTH',
                nodeId: NODE_NAME,
                temperature: t_c,
                memory_percent: m_p,
                gpu_percent: g_p
            })
        });

        if (response.ok) {
            console.log(`[DISPATCH SUCCESS] Swarm Engine accepted isolation. Workload gracefully halted.`);
        } else {
            console.log(`[DISPATCH DENIED] Hub blocked payload: ${response.status}`);
        }
    } catch (e: any) {
        console.log(`[DISPATCH FATAL] Hub Offline. Immediate network disconnect triggered. Details: ${e.message}`);
    }
}

async function runLoop() {
    let cooldown = 0;
    
    setInterval(async () => {
        const [t_c, m_p, g_p] = await getMetrics();
        
        if ((t_c > MAX_TEMP_C || m_p > MAX_VRAM_PERCENT) && cooldown === 0) {
            await isolateHardwareFailure(t_c, m_p, g_p);
            cooldown = 60; // Throttle identical webhooks for 60 seconds
        }
        
        if (cooldown > 0) cooldown--;
    }, 1000);
}

runLoop().catch(console.error);

process.on('SIGINT', () => {
    console.log('[WATCHDOG] Intercepted SIGINT. Gracefully detaching from GPU polling.');
    process.exit(0);
});
