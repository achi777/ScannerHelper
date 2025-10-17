# 🖨️ რეალური სკანერის გამოყენება

## ✅ ახლა მუშაობს რეალურ სკანერთან!

პროგრამა ახლა იყენებს **PowerShell WIA script**-ს რომელიც პირდაპირ უკავშირდება თქვენს სკანერს და ასკანერებს რეალურ დოკუმენტს.

## 🚀 როგორ გამოვიყენო:

### 1. დავრწმუნდე რომ სკანერი მზადაა:

✅ სკანერი ჩართულია და USB-ით მიერთებულია
✅ Driver-ები დაინსტალირებულია
✅ Windows-ის "Fax and Scan"-ით ტესტირებულია

### 2. Build & Run:

```batch
cd windowsRust
cargo build --release
target\release\scanner_helper.exe
```

### 3. PHP Server (ახალ terminal-ში):

```batch
cd windowsRust
php -S localhost:8080
```

### 4. Browser:

```
http://localhost:8080/index.html
```

### 5. დადე დოკუმენტი სკანერზე და დააჭირე "Scan Document"

## 📋 რა ხდება მიღმა ფარდის:

```
User clicks "Scan Document"
    ↓
Browser → HTTP GET /scan
    ↓
Rust server → PowerShell script
    ↓
PowerShell → WIA COM API
    ↓
WIA → Scanner Hardware
    ↓
Scanner → Scans document
    ↓
WIA → Saves BMP file
    ↓
PowerShell → Returns to Rust
    ↓
Rust → Reads BMP file
    ↓
Rust → Base64 encodes
    ↓
Rust → Sends to browser
    ↓
Browser → Displays scanned document
```

## 🔧 როგორ მუშაობს:

### PowerShell Script (`scan_wia.ps1`):

```powershell
# 1. Create WIA Device Manager
$deviceManager = New-Object -ComObject WIA.DeviceManager

# 2. Connect to scanner
$device = $deviceManager.DeviceInfos.Item(1).Connect()

# 3. Get scan source (flatbed)
$scanItem = $device.Items[0]

# 4. Set properties (DPI, color mode)
$scanItem.Properties.Item("6147").Value = 300  # X Resolution
$scanItem.Properties.Item("6148").Value = 300  # Y Resolution
$scanItem.Properties.Item("4103").Value = 3    # Color mode

# 5. Scan document
$image = $scanItem.Transfer("{B96B3CAB-0728-11D3-9D7B-0000F81EF32E}")

# 6. Save to file
$image.SaveFile("C:\Windows\Temp\scanned_doc.bmp")
```

### Rust Code (`src/main.rs`):

```rust
pub fn scan_document() -> Result<Vec<u8>, String> {
    // 1. Execute PowerShell script
    let output = Command::new("powershell.exe")
        .args(&["-ExecutionPolicy", "Bypass",
                "-File", "scan_wia.ps1",
                "-DPI", "300",
                "-ColorMode", "Color"])
        .output()?;

    // 2. Read scanned BMP file
    let data = fs::read("C:\\Windows\\Temp\\scanned_doc.bmp")?;

    // 3. Return image data
    Ok(data)
}
```

## ⚙️ პარამეტრების შეცვლა:

### DPI (Resolution):

```rust
// src/main.rs:57
"-DPI", "300"  // Change to 150, 200, 300, 600
```

დაბალი DPI = პატარა ფაილი, სწრაფი სკანირება
მაღალი DPI = დიდი ფაილი, ნელი სკანირება, უკეთესი ხარისხი

| DPI | File Size | Quality | Speed |
|-----|-----------|---------|-------|
| 150 | ~6 MB | Good | Fast |
| 300 | ~26 MB | Excellent | Medium |
| 600 | ~100 MB | Perfect | Slow |

### Color Mode:

```rust
// src/main.rs:58
"-ColorMode", "Color"  // Options: Color, Grayscale, BW
```

- **Color** - სრული ფერადი (3 bytes/pixel)
- **Grayscale** - ნაცრისფერი (1 byte/pixel)
- **BW** - შავ-თეთრი (1 bit/pixel)

## 📊 Output მაგალითი:

```
[INFO] Starting real WIA scanner...
[INFO] Calling PowerShell WIA script...
[INFO] Script path: D:\windowsRust\scan_wia.ps1
[INFO] Output path: C:\Windows\Temp\scanned_doc.bmp
[INFO] Executing scan...
[INFO] Please wait while the scanner is working...

[PowerShell Output]
[INFO] Starting WIA scan...
[INFO] DPI: 300
[INFO] Color Mode: Color
[INFO] WIA Device Manager created
[INFO] Found 1 scanner(s)
[INFO] Connected to scanner: HP LaserJet Scanner
[INFO] Found scan source: 0000\Root\Flatbed
[INFO] Using scan source: 0000\Root\Flatbed
[INFO] Set X Resolution: 300 DPI
[INFO] Set Y Resolution: 300 DPI
[INFO] Set Color Mode: Color (3)
[INFO] Starting scan operation...
[INFO] Please wait while scanning...
[SUCCESS] Scan completed!
[INFO] Saving to: C:\Windows\Temp\scanned_doc.bmp
[SUCCESS] Image saved successfully!
[INFO] File size: 25434.5 KB (24.8 MB)

[SUCCESS] PowerShell script completed
[INFO] Reading scanned file...
[SUCCESS] Scan completed! Size: 25434 KB
[INFO] Encoding to Base64...
[SUCCESS] Returning scan data to client
```

## 🐛 Troubleshooting:

### Error: "No scanners found"

**გადაწყვეტა:**
1. შეამოწმე სკანერი ჩართულია
2. გაუშვი "Windows Fax and Scan" და ნახე მუშაობს თუ არა
3. Device Manager-ში შეამოწმე driver-ები
4. გადატვირთე სკანერი

### Error: "PowerShell script not found"

**გადაწყვეტა:**
```batch
# Make sure scan_wia.ps1 is in the same directory as .exe
cd windowsRust
dir scan_wia.ps1

# If missing, it should be there after build
```

### Error: "Access denied"

**გადაწყვეტა:**
```batch
# Run as Administrator
Right-click scanner_helper.exe → "Run as administrator"
```

### Scanner is slow

**გადაწყვეტა:**
```rust
// Reduce DPI in src/main.rs:57
"-DPI", "150"  // Faster but lower quality
```

## 🎯 მახასიათებლები:

✅ **რეალური სკანირება** - იყენებს რეალურ სკანერს
✅ **300 DPI** - კარგი ხარისხი
✅ **ფერადი სკანირება** - სრული RGB
✅ **ავტომატური** - სკანერი ავტომატურად სკანავს
✅ **BMP ფორმატი** - უნაკლო ხარისხი
✅ **Windows WIA** - Native Windows API

## 📝 შედარება:

### Mock (test data):
```
❌ არ იყენებს სკანერს
❌ Test pattern
✅ სწრაფი
```

### Real Scanner:
```
✅ რეალური სკანერი
✅ რეალური დოკუმენტი
❌ ნელი (5-15 წამი)
```

## 💡 Tips:

1. **პირველი სკანირება ნელია** (სკანერის warming up)
2. **დაელოდე სანამ სკანერი დაამთავრებს** (10-20 წამი)
3. **დოკუმენტი უნდა იყოს სწორად დადებული** სკანერზე
4. **თუ ბევრი სკანირება გჭირდება**, დაამცირე DPI 150-მდე

## 🚀 Next Steps:

### Phase 1: ✅ DONE
- [x] რეალური WIA ინტეგრაცია
- [x] PowerShell script
- [x] 300 DPI სკანირება
- [x] ფერადი სურათი

### Phase 2: TODO
- [ ] Scanner selection UI (თუ რამდენიმე სკანერია)
- [ ] Preview ფუნქცია
- [ ] Scan area selection
- [ ] Progress indicator

### Phase 3: TODO
- [ ] PNG compression
- [ ] Multi-page scanning
- [ ] OCR integration
- [ ] PDF generation

---

**✅ ახლა პროგრამა რეალურად ასკანერებს დოკუმენტს!**

**📄 დადე დოკუმენტი სკანერზე → Click "Scan Document" → მიიღე რეალური სკანი!**

---

**🎉 წარმატებები!**
