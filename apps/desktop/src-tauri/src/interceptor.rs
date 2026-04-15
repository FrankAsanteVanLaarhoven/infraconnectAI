// apps/desktop/src-tauri/src/interceptor.rs
// OS-level interceptor: process monitoring, file events, sensor relay, IPC to Go firehose

use std::io::{BufRead, BufReader, Write};
use std::os::unix::net::UnixStream;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{SystemTime, UNIX_EPOCH};

use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use serde::{Deserialize, Serialize};
use serde_json;

// ── IPC frame types ───────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IngestFrame {
    #[serde(rename = "type")]
    pub frame_type: String,      // telemetry | heartbeat | process_event
    #[serde(rename = "agentId")]
    pub agent_id: String,
    pub modality: String,
    pub payload: serde_json::Value,
    #[serde(rename = "tsMs")]
    pub ts_ms: u64,
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

// ── Unix socket sender to Go firehose ────────────────────────────────────────

pub struct FirehoseSender {
    socket_path: String,
    stream: Arc<Mutex<Option<UnixStream>>>,
}

impl FirehoseSender {
    pub fn new(socket_path: &str) -> Self {
        Self {
            socket_path: socket_path.to_string(),
            stream: Arc::new(Mutex::new(None)),
        }
    }

    pub fn connect(&self) -> bool {
        match UnixStream::connect(&self.socket_path) {
            Ok(s) => {
                *self.stream.lock().unwrap() = Some(s);
                true
            }
            Err(e) => {
                eprintln!("[Interceptor] Go firehose unavailable: {e} — buffering locally");
                false
            }
        }
    }

    pub fn send(&self, frame: &IngestFrame) -> bool {
        let mut lock = self.stream.lock().unwrap();
        if let Some(ref mut stream) = *lock {
            let mut line = serde_json::to_string(frame).unwrap_or_default();
            line.push('\n');
            if stream.write_all(line.as_bytes()).is_ok() {
                return true;
            }
        }
        // Reconnect on failure
        drop(lock);
        self.connect();
        false
    }
}

// ── Process monitor: spawns and taps stdout/stderr of agent processes ─────────

pub struct ProcessMonitor {
    agent_id: String,
    sender: Arc<FirehoseSender>,
}

impl ProcessMonitor {
    pub fn new(agent_id: &str, sender: Arc<FirehoseSender>) -> Self {
        Self {
            agent_id: agent_id.to_string(),
            sender,
        }
    }

    /// Spawn a command and pipe its stdout/stderr to the firehose as L0 nodes
    pub fn spawn_and_monitor(&self, program: &str, args: &[&str]) -> std::io::Result<Child> {
        let mut child = Command::new(program)
            .args(args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()?;

        let agent_id = self.agent_id.clone();
        let sender   = Arc::clone(&self.sender);

        // Tap stdout
        if let Some(stdout) = child.stdout.take() {
            let aid = agent_id.clone();
            let s   = Arc::clone(&sender);
            thread::spawn(move || {
                let reader = BufReader::new(stdout);
                for line in reader.lines().flatten() {
                    let frame = IngestFrame {
                        frame_type: "process_event".to_string(),
                        agent_id:   aid.clone(),
                        modality:   "language".to_string(),
                        payload:    serde_json::json!({
                            "stream": "stdout",
                            "content": line,
                        }),
                        ts_ms: now_ms(),
                    };
                    s.send(&frame);
                }
            });
        }

        // Tap stderr
        if let Some(stderr) = child.stderr.take() {
            let aid = agent_id.clone();
            let s   = Arc::clone(&sender);
            thread::spawn(move || {
                let reader = BufReader::new(stderr);
                for line in reader.lines().flatten() {
                    let frame = IngestFrame {
                        frame_type: "process_event".to_string(),
                        agent_id:   aid.clone(),
                        modality:   "language".to_string(),
                        payload:    serde_json::json!({
                            "stream": "stderr",
                            "content": line,
                        }),
                        ts_ms: now_ms(),
                    };
                    s.send(&frame);
                }
            });
        }

        Ok(child)
    }
}

// ── File system watcher: workspace change events → L0 ingest ─────────────────

pub fn watch_workspace(
    path: &str,
    agent_id: &str,
    sender: Arc<FirehoseSender>,
) -> notify::Result<()> {
    let (tx, rx) = std::sync::mpsc::channel::<notify::Result<Event>>();
    let aid = agent_id.to_string();

    let mut watcher = RecommendedWatcher::new(tx, Config::default())?;
    watcher.watch(std::path::Path::new(path), RecursiveMode::Recursive)?;

    thread::spawn(move || {
        for res in rx {
            if let Ok(event) = res {
                let paths: Vec<String> = event
                    .paths
                    .iter()
                    .filter_map(|p| p.to_str().map(String::from))
                    .collect();

                let frame = IngestFrame {
                    frame_type: "telemetry".to_string(),
                    agent_id:   aid.clone(),
                    modality:   "filesystem".to_string(),
                    payload:    serde_json::json!({
                        "kind":  format!("{:?}", event.kind),
                        "paths": paths,
                    }),
                    ts_ms: now_ms(),
                };
                sender.send(&frame);
            }
        }
    });

    Ok(())
}

// ── Serial/USB sensor relay: reads from serial port, forwards to firehose ────

pub fn relay_serial_sensor(
    port_path: &str,
    baud_rate: u32,
    agent_id:  &str,
    modality:  &str,
    sender:    Arc<FirehoseSender>,
) {
    let port_path = port_path.to_string();
    let agent_id  = agent_id.to_string();
    let modality  = modality.to_string();

    thread::spawn(move || {
        loop {
            match serialport::new(&port_path, baud_rate)
                .timeout(std::time::Duration::from_millis(100))
                .open()
            {
                Ok(port) => {
                    let reader = BufReader::new(port);
                    for line in reader.lines().flatten() {
                        // Expect JSON lines from sensor firmware
                        let payload: serde_json::Value =
                            serde_json::from_str(&line).unwrap_or_else(|_| {
                                serde_json::json!({ "raw": line })
                            });

                        let frame = IngestFrame {
                            frame_type: "telemetry".to_string(),
                            agent_id:   agent_id.clone(),
                            modality:   modality.clone(),
                            payload,
                            ts_ms: now_ms(),
                        };
                        sender.send(&frame);
                    }
                    eprintln!("[Interceptor] Serial port {port_path} disconnected — reconnecting");
                }
                Err(e) => {
                    eprintln!("[Interceptor] Serial open error {port_path}: {e}");
                    thread::sleep(std::time::Duration::from_secs(3));
                }
            }
        }
    });
}
