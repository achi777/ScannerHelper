# 🖨️ Scanner Helper - Real WIA Scanner Integration

**Rust-based document scanner with real Windows WIA scanner support**

## ⚡ Quick Start

### Standalone Mode ⭐⭐⭐ (რეკომენდებული)

```batch
# 1. Build
cargo build --release

# 2. Run - that's it!
target\release\scanner_helper.exe

# The .exe:
# - Hides console window automatically
# - Starts service in background
# - Everything embedded (no external files needed!)

# 3. Access scanner
http://localhost:8080/index.html
```

**მხოლოდ ერთი .exe ფაილი - არაფერი სხვა არ არის საჭირო!** 🎉

### Option 2: Auto-Start Scripts (Alternative)

```batch
# 1. Build
cargo build --release

# 2. Install to Windows Startup
install_full_startup.bat

# 3. Reboot or Logout
# Services will start automatically and run hidden!

# 4. Open browser anytime
http://localhost:8080/index.html
```

### Option 3: Manual Start

```batch
# 1. Build
cargo build --release

# 2. Run scanner service
target\release\scanner_helper.exe

# 3. Run PHP server (new terminal)
php -S localhost:8080

# 4. Open browser
http://localhost:8080/index.html

# 5. Scan!
Place document on scanner → Click "Scan Document" → Wait 10-20s → Done!
```

## ✅ What It Does

- 🖨️ **Real WIA Scanner** - Uses your actual scanner hardware
- 📄 **300 DPI** - High quality scanning
- 🎨 **Color/Grayscale** - Configurable
- ⚡ **PowerShell + Rust** - Fast and reliable
- 🌐 **Web UI** - Easy to use browser interface
- 🔒 **Hidden Mode** - No windows, completely silent background operation
- 📦 **Standalone** - Single .exe, no external files needed
- ✅ **JSON Safe** - Fixed "Bad escaped character" errors

## 📚 Documentation

| File | Description |
|------|-------------|
| **[STANDALONE_GUIDE.md](STANDALONE_GUIDE.md)** | 📦 Standalone - ერთი .exe ყველაფრით! |
| **[SIMPLE_START.md](SIMPLE_START.md)** | ⚡ 2 ნაბიჯი - სწრაფი დაწყება |
| **[START_HERE.md](START_HERE.md)** | 🚀 Begin here! |
| **[AUTOSTART_GUIDE.md](AUTOSTART_GUIDE.md)** | 📜 Auto-start scripts (optional) |
| **[FINAL_SOLUTION.md](FINAL_SOLUTION.md)** | 📋 Complete solution |
| **[README_REAL_SCANNER.md](README_REAL_SCANNER.md)** | 🔧 Detailed explanation |

## 🔧 How It Works

```
Browser → Rust Server → PowerShell Script → WIA API → Scanner → Document
```

1. User clicks "Scan Document" in browser
2. Rust server executes PowerShell WIA script
3. PowerShell connects to scanner via WIA API
4. Scanner scans the document
5. Image saved as BMP file
6. Rust reads and returns to browser

## 📁 Key Files

```
windowsRust/
├── scan_wia.ps1                      ← PowerShell WIA script
├── target/release/scanner_helper.exe ← Run this
├── src/main.rs                       ← Rust implementation
├── index.html                        ← Web UI
└── README.md                         ← This file
```

## 🎯 Features

- ✅ Real scanner integration (not mock data!)
- ✅ 300 DPI high quality
- ✅ Color/Grayscale/BW modes
- ✅ BMP format
- ✅ Windows WIA native API
- ✅ Web interface
- ✅ Base64 encoding
- ✅ Error handling

## ⚠️ Requirements

- Windows 10/11
- Scanner connected (USB)
- Scanner drivers installed
- Rust toolchain
- PHP (for web server)

## 🐛 Troubleshooting

### "No scanners found"
→ Check scanner is ON and connected via USB

### "PowerShell script not found"
→ Ensure `scan_wia.ps1` is in the same directory as the .exe

### Slow scanning
→ Change DPI in `src/main.rs:57` → `"-DPI", "150"`

### Access denied
→ Run as Administrator

## 📊 Output Example

```
[INFO] Starting real WIA scanner...
[INFO] Calling PowerShell WIA script...
[INFO] Executing scan...

[PowerShell Output]
[INFO] WIA Device Manager created
[INFO] Connected to scanner: HP LaserJet Scanner
[INFO] Starting scan operation...
[SUCCESS] Scan completed! Size: 25434 KB

[SUCCESS] Scan completed! Size: 25434 KB
[SUCCESS] Returning scan data to client
```

## 🎉 Result

**Before:** 🔵 1 pixel blue dot (mock data)

**Now:** 📄 Real scanned document from your scanner!

---

**Build on Windows and test with your real scanner!** 🚀

**Questions? See [START_HERE.md](START_HERE.md)**
