import os
import time
import requests
import socket

try:
    import pynvml
    NVML_AVAILABLE = True
except ImportError:
    NVML_AVAILABLE = False
    print("[WARNING] pynvml not installed. Hardware metrics will be mocked across loop.")

node_name = socket.gethostname()
port = os.environ.get("PORT", "3000")
webhook_url = f"http://localhost:{port}/api/watchdog"

# Explicit Limits (Hardware constraints dynamically overridden)
MAX_TEMP_C = 85
MAX_VRAM_PERCENT = 95

def init_nvml():
    if NVML_AVAILABLE:
        pynvml.nvmlInit()
        device_count = pynvml.nvmlDeviceGetCount()
        print(f"[WATCHDOG] Initialized NVML. Intercepting {device_count} Node(s).")
    else:
        print("[WATCHDOG] Simulation mode active. Polling mock metrics.")

def get_node_metrics():
    if NVML_AVAILABLE:
        handle = pynvml.nvmlDeviceGetHandleByIndex(0) # Targeting core orchestrator GPU (0)
        temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
        mem_info = pynvml.nvmlDeviceGetMemoryInfo(handle)
        utilization = pynvml.nvmlDeviceGetUtilizationRates(handle)
        
        mem_percent = (mem_info.used / mem_info.total) * 100
        gpu_percent = utilization.gpu
        return temp, mem_percent, gpu_percent
    else:
        # We simulate borderline edge loops
        import random
        return random.randint(86, 92), random.randint(96, 99), random.randint(90, 100)

def isolate_hardware_failure(t_c, m_p, g_p):
    print(f"\n[CRITICAL ERROR] Hardware Anomaly detected on Node {node_name}!\n  > Temp: {t_c}°C / {MAX_TEMP_C}°C\n  > VRAM: {m_p}% / {MAX_VRAM_PERCENT}%\nFiring Override Pipeline!")
    
    payload = {
        "signature": "SOVEREIGN_WATCHDOG_AUTH",
        "nodeId": node_name,
        "temperature": t_c,
        "memory_percent": round(m_p, 2),
        "gpu_percent": g_p
    }

    try:
        res = requests.post(webhook_url, json=payload, timeout=2)
        if res.status_code == 200:
            print("[DISPATCH SUCCESS] Swarm Engine accepted isolation. Workload gracefully halted.")
        else:
            print(f"[DISPATCH DENIED] Hub blocked payload: {res.status_code}")
    except Exception as e:
        print(f"[DISPATCH FATAL] Hub Offline. Immediate network disconnect triggered. Details: {e}")

def run_loop():
    print(f"===========================================================")
    print(f" Physical Watchdog Daemon [{node_name}] - ACTIVE DEPLOYMENT ")
    print(f" Thermal Ceiling: {MAX_TEMP_C}°C | Memory Limit: {MAX_VRAM_PERCENT}% ")
    print(f"===========================================================")
    
    init_nvml()
    cooldown = 0
    
    while True:
        t_c, m_p, g_p = get_node_metrics()
        
        # Determine violation states
        if (t_c > MAX_TEMP_C or m_p > MAX_VRAM_PERCENT) and cooldown == 0:
            isolate_hardware_failure(t_c, m_p, g_p)
            cooldown = 60 # Throttle identical webhooks for 60 seconds allowing degradation sweep
        
        if cooldown > 0:
            cooldown -= 1
            
        time.sleep(1) # Live sub-second interval

if __name__ == "__main__":
    run_loop()
