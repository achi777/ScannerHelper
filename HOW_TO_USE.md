# 📖 როგორ გამოვიყენო რეალური სკანერი

## ⚡ სწრაფი ინსტრუქცია:

### 1️⃣ Build (Windows):
```batch
cd windowsRust
cargo build --release
```

### 2️⃣ Run Scanner Service:
```batch
target\release\scanner_helper.exe
```

### 3️⃣ Run PHP Server (ახალ terminal):
```batch
php -S localhost:8080
```

### 4️⃣ Open Browser:
```
http://localhost:8080/index.html
```

### 5️⃣ Scan:
1. **დადე დოკუმენტი სკანერზე** 📄
2. **Click "Scan Document"** 🖱️
3. **დაელოდე 10-20 წამი** ⏳
4. **ნახე დასკანერებული დოკუმენტი** ✅

## ✅ რა უნდა ნახო:

### Console (scanner_helper.exe):
```
[INFO] Starting real WIA scanner...
[INFO] Calling PowerShell WIA script...
[INFO] Executing scan...
[INFO] Please wait while the scanner is working...

[PowerShell WIA Output]
[INFO] WIA Device Manager created
[INFO] Connected to scanner: Your Scanner Name
[INFO] Starting scan operation...
[SUCCESS] Scan completed!

[SUCCESS] PowerShell script completed
[SUCCESS] Scan completed! Size: 25434 KB
[SUCCESS] Returning scan data to client
```

### Browser:
- ნახავ რეალურ დასკანერებულ დოკუმენტს
- არა test pattern-ს ❌
- არამედ რეალურ დოკუმენტს რომელიც სკანერზე დადე ✅

## ❓ რა თუ რაღაც არ მუშაობს?

### "No scanners found"
→ შეამოწმე სკანერი ჩართულია და USB-ით მიერთებულია

### "PowerShell script not found"
→ დარწმუნდი რომ `scan_wia.ps1` არის `windowsRust` საქაღალდეში

### სკანირება ძალიან ნელია
→ DPI შემცირება: შეცვალე `src/main.rs:57` → `"-DPI", "150"`

### Access denied
→ Run as Administrator (Right-click → "Run as administrator")

## 🎯 მთავარი ფაილები:

```
windowsRust/
├── target/release/scanner_helper.exe  ← Run this
├── scan_wia.ps1                       ← PowerShell WIA script
├── index.html                         ← Open in browser
└── src/main.rs                        ← Rust code
```

## 💾 დამატებითი პარამეტრები:

### შემცირე ფაილის ზომა (DPI):
```rust
// src/main.rs:57
"-DPI", "150"  // 6 MB instead of 26 MB
```

### Grayscale (შავ-თეთრი):
```rust
// src/main.rs:58
"-ColorMode", "Grayscale"
```

---

**🎉 ეს ყველაფერი! ახლა დააკომპილირე Windows-ზე და ამოწმე!**

**📧 დამატებითი დეტალებისთვის იხ.:** [README_REAL_SCANNER.md](README_REAL_SCANNER.md)
