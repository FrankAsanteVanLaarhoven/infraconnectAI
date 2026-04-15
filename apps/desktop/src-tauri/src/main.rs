// apps/desktop/src-tauri/src/main.rs

mod interceptor;

use interceptor::{FirehoseSender, ProcessMonitor, relay_serial_sensor, watch_workspace};
use std::sync::Arc;
use tauri::{Manager, State};

struct AppState {
    sender: Arc<FirehoseSender>,
}

#[tauri::command]
fn spawn_agent(
    program: String,
    args: Vec<String>,
    agent_id: String,
    state: State<AppState>,
) -> Result<String, String> {
    let monitor = ProcessMonitor::new(&agent_id, Arc::clone(&state.sender));
    let arg_refs: Vec<&str> = args.iter().map(String::as_str).collect();
    monitor
        .spawn_and_monitor(&program, &arg_refs)
        .map(|child| format!("Spawned PID {}", child.id()))
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn connect_sensor(
    port: String,
    baud: u32,
    agent_id: String,
    modality: String,
    state: State<AppState>,
) {
    relay_serial_sensor(&port, baud, &agent_id, &modality, Arc::clone(&state.sender));
}

#[tauri::command]
fn watch_directory(
    path: String,
    agent_id: String,
    state: State<AppState>,
) -> Result<(), String> {
    watch_workspace(&path, &agent_id, Arc::clone(&state.sender))
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_firehose_status(state: State<AppState>) -> String {
    if state.sender.connect() {
        "connected".to_string()
    } else {
        "offline".to_string()
    }
}

fn main() {
    let sender = Arc::new(FirehoseSender::new("/tmp/infraconnectai-ingest.sock"));
    sender.connect(); // attempt initial connection — non-fatal if Go not running

    tauri::Builder::default()
        .manage(AppState { sender })
        .invoke_handler(tauri::generate_handler![
            spawn_agent,
            connect_sensor,
            watch_directory,
            get_firehose_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
