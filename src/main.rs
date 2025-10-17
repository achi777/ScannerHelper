use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{body::Incoming as IncomingBody, Request, Response, StatusCode};
use hyper_util::rt::TokioIo;
use http_body_util::Full;
use tokio::net::TcpListener;
use std::sync::{Arc, Mutex};
use base64::{Engine as _, engine::general_purpose};

#[cfg(windows)]
use winreg::enums::*;
#[cfg(windows)]
use winreg::RegKey;
#[cfg(windows)]
use std::env;

#[cfg(windows)]
use tray_icon::{
    menu::{Menu, MenuItem, MenuEvent},
    TrayIconBuilder, Icon,
};

#[cfg(windows)]
use std::sync::atomic::{AtomicBool, Ordering};

#[cfg(windows)]
use winit::event_loop::{EventLoopBuilder, ControlFlow};

type Bytes = hyper::body::Bytes;

// Scanner state
struct ScannerState {
    last_scanned_image: Option<String>,
}

// Base64 encode helper
fn base64_encode(data: &[u8]) -> String {
    general_purpose::STANDARD.encode(data)
}

// Windows Registry Auto-start Registration
#[cfg(windows)]
fn register_autostart() -> std::result::Result<(), String> {
    use std::path::PathBuf;

    println!("[INFO] Checking Windows Registry auto-start...");

    // Get current executable path
    let exe_path = match env::current_exe() {
        Ok(path) => path,
        Err(e) => return Err(format!("Failed to get executable path: {}", e)),
    };

    let exe_path_str = exe_path.to_string_lossy().to_string();
    println!("[INFO] Executable path: {}", exe_path_str);

    // Open registry key for current user
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let run_key = match hkcu.open_subkey_with_flags(
        r"Software\Microsoft\Windows\CurrentVersion\Run",
        KEY_READ | KEY_WRITE,
    ) {
        Ok(key) => key,
        Err(e) => return Err(format!("Failed to open registry Run key: {}", e)),
    };

    // Check if already registered
    let app_name = "ScannerHelper";
    match run_key.get_value::<String, _>(app_name) {
        Ok(existing_path) => {
            if existing_path == exe_path_str {
                println!("[INFO] Already registered in Windows startup (same path)");
                return Ok(());
            } else {
                println!("[INFO] Updating registry entry (path changed)");
                println!("[INFO] Old: {}", existing_path);
                println!("[INFO] New: {}", exe_path_str);
            }
        }
        Err(_) => {
            println!("[INFO] Not registered yet, adding to Windows startup...");
        }
    }

    // Register in startup
    match run_key.set_value(app_name, &exe_path_str) {
        Ok(_) => {
            println!("[SUCCESS] Registered in Windows startup!");
            println!("[INFO] Will auto-start on next login");
            Ok(())
        }
        Err(e) => Err(format!("Failed to write registry: {}", e)),
    }
}

// Hide console window on Windows
#[cfg(windows)]
fn hide_console_window() {
    use windows::Win32::System::Console::GetConsoleWindow;
    use windows::Win32::UI::WindowsAndMessaging::{ShowWindow, SW_HIDE};

    unsafe {
        let console_window = GetConsoleWindow();
        if !console_window.is_invalid() {
            ShowWindow(console_window, SW_HIDE);

            // Setup log file redirect
            setup_log_file();
        }
    }
}

// Setup log file for hidden mode
#[cfg(windows)]
fn setup_log_file() {
    use std::fs::OpenOptions;
    use std::io::Write;

    // Get executable directory
    if let Ok(exe_path) = env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let log_path = exe_dir.join("scanner_helper.log");

            // Try to open/create log file
            if let Ok(mut file) = OpenOptions::new()
                .create(true)
                .append(true)
                .open(&log_path)
            {
                let timestamp = chrono::Local::now().format("%Y-%m-%d %H:%M:%S");
                let _ = writeln!(file, "\n[{}] Scanner Helper Started (Hidden Mode)", timestamp);
                let _ = writeln!(file, "[INFO] Log file: {}", log_path.display());
            }
        }
    }
}

// Windows WIA Scanner Implementation
#[cfg(windows)]
mod wia_scanner {
    use std::process::Command;
    use std::fs;
    use std::path::Path;

    // Embedded PowerShell script
    const POWERSHELL_SCRIPT: &str = r#"
param(
    [string]$OutputPath = "C:\Windows\Temp\scanned_doc.bmp",
    [int]$DPI = 600,
    [string]$ColorMode = "Color"
)

try {
    $deviceManager = New-Object -ComObject WIA.DeviceManager
    $devices = $deviceManager.DeviceInfos
    if ($devices.Count -eq 0) {
        Write-Error "No scanners found!"
        exit 1
    }

    $device = $devices.Item(1).Connect()
    $scanItem = $null
    foreach ($item in $device.Items) {
        $scanItem = $item
        break
    }

    if ($null -eq $scanItem) {
        Write-Error "No scan source available!"
        exit 1
    }

    try { $scanItem.Properties.Item("6147").Value = $DPI } catch {}
    try { $scanItem.Properties.Item("6148").Value = $DPI } catch {}
    try {
        $colorValue = 3
        if ($ColorMode -eq "Grayscale") { $colorValue = 2 }
        if ($ColorMode -eq "BW") { $colorValue = 1 }
        $scanItem.Properties.Item("4103").Value = $colorValue
    } catch {}

    $image = $scanItem.Transfer("{B96B3CAB-0728-11D3-9D7B-0000F81EF32E}")
    if ($null -eq $image) {
        Write-Error "Scan failed - no image returned!"
        exit 1
    }

    $directory = [System.IO.Path]::GetDirectoryName($OutputPath)
    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    if (Test-Path $OutputPath) {
        Remove-Item $OutputPath -Force
    }

    $image.SaveFile($OutputPath)

    if (Test-Path $OutputPath) {
        $fileSize = (Get-Item $OutputPath).Length
        Write-Output "SUCCESS:$fileSize"
        exit 0
    } else {
        Write-Error "Failed to save file!"
        exit 1
    }
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
"#;

    pub fn scan_document() -> std::result::Result<Vec<u8>, String> {
        println!("[INFO] Starting real WIA scanner...");
        println!("[INFO] Executing PowerShell WIA script...");

        let output_path = "C:\\Windows\\Temp\\scanned_doc.bmp";
        println!("[INFO] Output path: {}", output_path);

        // Execute embedded PowerShell script
        println!("[INFO] Executing scan...");
        println!("[INFO] Please wait while the scanner is working...");

        let output = Command::new("powershell.exe")
            .args(&[
                "-ExecutionPolicy", "Bypass",
                "-Command", POWERSHELL_SCRIPT,
                "-OutputPath", output_path,
                "-DPI", "600",
                "-ColorMode", "Color"
            ])
            .output()
            .map_err(|e| format!("Failed to execute PowerShell: {}", e))?;

        // Check if command succeeded
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let stdout = String::from_utf8_lossy(&output.stdout);
            eprintln!("[ERROR] PowerShell error:\n{}", stderr);
            eprintln!("[ERROR] PowerShell output:\n{}", stdout);
            return Err(format!("Scan failed: {}", stderr));
        }

        println!("[SUCCESS] PowerShell script completed");

        // Read scanned file
        let output_file = Path::new(output_path);
        if !output_file.exists() {
            return Err(format!("Scanned file not found: {}", output_path));
        }

        println!("[INFO] Reading scanned file...");
        let data = fs::read(output_file)
            .map_err(|e| format!("Failed to read scanned file: {}", e))?;

        println!("[SUCCESS] Scan completed! Size: {} KB", data.len() / 1024);

        // Clean up temp file
        let _ = fs::remove_file(output_file);

        Ok(data)
    }
}

// Cross-platform scanner function
#[cfg(windows)]
fn scan_document_platform() -> std::result::Result<Vec<u8>, String> {
    println!("\n[INFO] === Windows WIA Scanner ===");
    wia_scanner::scan_document()
}

#[cfg(not(windows))]
fn scan_document_platform() -> std::result::Result<Vec<u8>, String> {
    Err("This Windows-specific build is not supported on this platform".to_string())
}

// Handle HTTP requests
async fn handle_request(
    req: Request<IncomingBody>,
    state: Arc<Mutex<ScannerState>>,
) -> Result<Response<Full<Bytes>>, hyper::Error> {
    let path = req.uri().path();
    let method = req.method();

    println!("[INFO] {} {}", method, path);

    // CORS headers
    let mut response = Response::new(Full::default());
    response.headers_mut().insert(
        "Access-Control-Allow-Origin",
        "*".parse().unwrap(),
    );
    response.headers_mut().insert(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS".parse().unwrap(),
    );
    response.headers_mut().insert(
        "Access-Control-Allow-Headers",
        "Content-Type".parse().unwrap(),
    );

    // Handle OPTIONS (CORS preflight)
    if method == hyper::Method::OPTIONS {
        *response.status_mut() = StatusCode::OK;
        return Ok(response);
    }

    // Route handling
    match (method, path) {
        (&hyper::Method::GET, "/status") => {
            println!("[INFO] Status check request");
            response.headers_mut().insert(
                "Content-Type",
                "application/json".parse().unwrap(),
            );
            *response.body_mut() = Full::new(Bytes::from(
                r#"{"status":"running","platform":"Windows","scanner":"WIA"}"#
            ));
            Ok(response)
        }

        (&hyper::Method::GET, "/scan") => {
            println!("\n========== SCAN REQUEST ==========");
            println!("[INFO] Platform: Windows");
            println!("[INFO] Scanner API: WIA");

            // Perform scan
            match scan_document_platform() {
                Ok(image_data) => {
                    println!("[INFO] Scan successful: {} bytes", image_data.len());
                    println!("[INFO] Encoding to Base64...");
                    let base64_data = base64_encode(&image_data);

                    // Store in state
                    {
                        let mut state = state.lock().unwrap();
                        state.last_scanned_image = Some(base64_data.clone());
                    }

                    println!("[SUCCESS] Returning scan data to client");
                    println!("==================================\n");

                    let json_response = format!(
                        r#"{{"success":true,"image":"data:image/bmp;base64,{}"}}"#,
                        base64_data
                    );

                    response.headers_mut().insert(
                        "Content-Type",
                        "application/json".parse().unwrap(),
                    );
                    *response.body_mut() = Full::new(Bytes::from(json_response));
                    Ok(response)
                }
                Err(e) => {
                    eprintln!("[ERROR] Scan failed: {}", e);
                    println!("==================================\n");

                    *response.status_mut() = StatusCode::INTERNAL_SERVER_ERROR;
                    response.headers_mut().insert(
                        "Content-Type",
                        "application/json".parse().unwrap(),
                    );

                    // Use serde_json to properly escape error message
                    use serde_json::json;
                    let error_json = json!({
                        "success": false,
                        "error": e
                    });
                    let error_response = error_json.to_string();

                    *response.body_mut() = Full::new(Bytes::from(error_response));
                    Ok(response)
                }
            }
        }

        _ => {
            *response.status_mut() = StatusCode::NOT_FOUND;
            response.headers_mut().insert(
                "Content-Type",
                "text/plain".parse().unwrap(),
            );
            *response.body_mut() = Full::new(Bytes::from("Not Found"));
            Ok(response)
        }
    }
}

#[cfg(windows)]
fn setup_tray_icon() -> Result<(tray_icon::TrayIcon, winit::event_loop::EventLoop<()>), Box<dyn std::error::Error>> {
    // Create a simple scanner icon (blue with white scanner symbol)
    let mut icon_rgba = vec![0u8; 32 * 32 * 4];
    for y in 0..32 {
        for x in 0..32 {
            let idx = ((y * 32) + x) * 4;

            // Create scanner icon shape
            let is_scanner = (x >= 8 && x <= 24 && y >= 10 && y <= 22) ||
                           (x >= 12 && x <= 20 && y >= 6 && y <= 10);

            if is_scanner {
                // White scanner
                icon_rgba[idx] = 255;     // R
                icon_rgba[idx + 1] = 255; // G
                icon_rgba[idx + 2] = 255; // B
                icon_rgba[idx + 3] = 255; // A
            } else {
                // Blue background
                icon_rgba[idx] = 66;      // R
                icon_rgba[idx + 1] = 126; // G
                icon_rgba[idx + 2] = 234; // B
                icon_rgba[idx + 3] = 255; // A
            }
        }
    }

    let icon = Icon::from_rgba(icon_rgba, 32, 32)?;

    // Create menu
    let menu = Menu::new();
    let quit = MenuItem::new("Exit (გათიშვა)", true, None);
    menu.append(&quit)?;

    // Create event loop for tray icon
    let event_loop = EventLoopBuilder::new().build()?;

    // Create tray icon
    let tray_icon = TrayIconBuilder::new()
        .with_menu(Box::new(menu))
        .with_tooltip("Scanner Helper\nსკანერის დამხმარე")
        .with_icon(icon)
        .build()?;

    println!("[SUCCESS] System tray icon created");

    Ok((tray_icon, event_loop))
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // Hide console window on Windows
    #[cfg(windows)]
    hide_console_window();

    println!("\n=====================================");
    println!("  DOCUMENT SCANNER HELPER SERVICE");
    println!("  Rust Edition - Windows WIA");
    println!("=====================================\n");

    #[cfg(not(windows))]
    {
        eprintln!("[ERROR] This is a Windows-specific build!");
        eprintln!("[ERROR] Please use the macOS or Linux version on this platform.");
        return Ok(());
    }

    #[cfg(windows)]
    {
        println!("[INFO] Platform: Windows");

        // Create system tray icon
        let (tray_icon, event_loop) = match setup_tray_icon() {
            Ok(result) => result,
            Err(e) => {
                eprintln!("[WARNING] Failed to create system tray icon: {}", e);
                eprintln!("[INFO] Continuing without system tray...");
                return Ok(());
            }
        };

        // Start HTTP server in background thread
        let server_handle = std::thread::spawn(|| {
            let runtime = tokio::runtime::Runtime::new().unwrap();
            runtime.block_on(async {
                let addr = "127.0.0.1:8765";
                let listener = TcpListener::bind(addr).await.unwrap();

                println!("[SUCCESS] Scanner helper service started");
                println!("[INFO] Listening on http://{}", addr);
                println!("[INFO] WIA scanner support enabled");
                println!("[INFO] Waiting for connections...\n");

                let state = Arc::new(Mutex::new(ScannerState {
                    last_scanned_image: None,
                }));

                loop {
                    let (stream, peer_addr) = listener.accept().await.unwrap();
                    let io = TokioIo::new(stream);
                    let state = Arc::clone(&state);

                    println!("[INFO] New client connected from {}", peer_addr);

                    tokio::task::spawn(async move {
                        if let Err(err) = http1::Builder::new()
                            .serve_connection(
                                io,
                                service_fn(move |req| {
                                    let state = Arc::clone(&state);
                                    handle_request(req, state)
                                }),
                            )
                            .await
                        {
                            eprintln!("[ERROR] Connection error: {:?}", err);
                        }
                    });
                }
            });
        });

        // Run event loop for system tray
        let menu_channel = MenuEvent::receiver();
        let _ = event_loop.run(move |_event, elwt| {
            elwt.set_control_flow(ControlFlow::Wait);

            // Check for menu events
            while let Ok(_menu_event) = menu_channel.try_recv() {
                println!("[INFO] Exit requested from system tray");
                std::process::exit(0);
            }
        });

        // This will never be reached, but needed for type checking
        server_handle.join().unwrap();
    }

    #[cfg(not(windows))]
    {
        let addr = "127.0.0.1:8765";
        let listener = TcpListener::bind(addr).await?;

        println!("[SUCCESS] Scanner helper service started");
        println!("[INFO] Listening on http://{}", addr);

        let state = Arc::new(Mutex::new(ScannerState {
            last_scanned_image: None,
        }));

        loop {
            let (stream, peer_addr) = listener.accept().await?;
            let io = TokioIo::new(stream);
            let state = Arc::clone(&state);

            tokio::task::spawn(async move {
                if let Err(err) = http1::Builder::new()
                    .serve_connection(
                        io,
                        service_fn(move |req| {
                            let state = Arc::clone(&state);
                            handle_request(req, state)
                        }),
                    )
                    .await
                {
                    eprintln!("[ERROR] Connection error: {:?}", err);
                }
            });
        }
    }

    Ok(())
}
