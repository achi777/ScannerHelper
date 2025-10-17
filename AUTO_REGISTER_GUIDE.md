# 🚀 ავტომატური რეგისტრაცია - Built-in

## ✅ რა გაკეთდა:

**scanner_helper.exe ახლა თავად აკეთებს ყველაფერს:**

1. ✅ **პირველი გაშვებისას** - რეგისტრირდება Windows Registry-ში
2. ✅ **Console დამალვა** - ფანჯარა მაშინვე იმალება
3. ✅ **Log ფაილი** - logs წერს `scanner_helper.log`-ში
4. ✅ **ავტომატური გაშვება** - Windows login-ზე ავტომატურად გაეშვება

---

## ⚡ გამოყენება (ძალიან მარტივი!):

### 1. Build:
```batch
cargo build --release
```

### 2. გაუშვი პირველად:
```batch
target\release\scanner_helper.exe
```

**რა მოხდება:**
- ✅ Console ფანჯარა მაშინვე გაქრება
- ✅ რეგისტრირდება Windows Registry-ში
- ✅ Service გაეშვება background-ში
- ✅ მზადაა სკანირებისთვის: `http://localhost:8080/index.html`

### 3. გადატვირთე კომპიუტერი:
```batch
shutdown /r /t 0
```

### 4. შემდეგ login-ზე:
- ✅ **ავტომატურად გაეშვება**
- ✅ **სრულად დამალული**
- ✅ **მუდამ მზად არის**

---

## 🔧 როგორ მუშაობს:

### პირველი გაშვება:

```
User: scanner_helper.exe
    ↓
1. Hide console window (SW_HIDE)
    ↓
2. Check Registry:
   HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run
    ↓
3. If not registered:
   → Add "ScannerHelper" = "C:\path\to\scanner_helper.exe"
    ↓
4. Start HTTP server (port 8765)
    ↓
5. Run silently in background
```

### შემდეგი login-ები:

```
Windows Login
    ↓
Registry "Run" entry
    ↓
scanner_helper.exe (auto-start)
    ↓
Console hidden
    ↓
Service running
```

---

## 📊 Registry Entry:

### Location:
```
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run
```

### Key:
```
Name:  ScannerHelper
Type:  REG_SZ (String)
Value: C:\path\to\scanner_helper.exe
```

### როგორ ნახო Registry-ში:

```batch
REM Open Registry Editor
regedit

REM Navigate to:
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run

REM Look for: "ScannerHelper"
```

---

## 🔍 როგორ შევამოწმო:

### 1. Check Task Manager:
```
Ctrl + Shift + Esc
→ Processes
→ ნახე "scanner_helper.exe"
```

### 2. Check Registry:
```batch
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v ScannerHelper
```

Output:
```
ScannerHelper    REG_SZ    C:\path\to\scanner_helper.exe
```

### 3. Check Log File:
```batch
type scanner_helper.log
```

Output:
```
[2025-01-13 15:30:45] Scanner Helper Started (Hidden Mode)
[INFO] Log file: C:\path\to\scanner_helper.log
[INFO] Checking Windows Registry auto-start...
[INFO] Executable path: C:\path\to\scanner_helper.exe
[INFO] Not registered yet, adding to Windows startup...
[SUCCESS] Registered in Windows startup!
[INFO] Will auto-start on next login
[SUCCESS] Scanner helper service started
[INFO] Listening on http://127.0.0.1:8765
```

### 4. Test Scanner:
```
Browser: http://localhost:8080/index.html
→ Click "Scan Document"
→ უნდა იმუშაოს!
```

---

## 📝 Console Output:

### პირველი გაშვება:
```
[INFO] Console window hidden
[INFO] Checking Windows Registry auto-start...
[INFO] Executable path: C:\Users\Name\scanner\scanner_helper.exe
[INFO] Not registered yet, adding to Windows startup...
[SUCCESS] Registered in Windows startup!
[INFO] Will auto-start on next login
[SUCCESS] Scanner helper service started
[INFO] Listening on http://127.0.0.1:8765
```

### მეორე გაშვება (უკვე რეგისტრირებული):
```
[INFO] Console window hidden
[INFO] Checking Windows Registry auto-start...
[INFO] Executable path: C:\Users\Name\scanner\scanner_helper.exe
[INFO] Already registered in Windows startup (same path)
[SUCCESS] Scanner helper service started
[INFO] Listening on http://127.0.0.1:8765
```

---

## 🎯 მახასიათებლები:

### 1. ავტომატური რეგისტრაცია ✅
- პირველ გაშვებაზე თავად რეგისტრირდება
- Registry-ში ინახავს სრულ path-ს
- თუ უკვე რეგისტრირებულია - არ აკეთებს რეაგისტრაციას

### 2. Console დამალვა ✅
- მაშინვე იმალება გაშვებისას
- არანაირი ფანჯარა არ ჩანს
- `SW_HIDE` flag გამოიყენება

### 3. Path განახლება ✅
თუ .exe-ს სხვა ადგილას გადაიტანთ:
```
Old: C:\old\path\scanner_helper.exe
New: C:\new\path\scanner_helper.exe

→ ავტომატურად განაახლებს Registry-ში!
```

### 4. Log ფაილი ✅
- ინახება იმავე საქაღალდეში სადაც .exe
- Timestamp-ებით
- Append mode (არ წაშლის ძველ ჩანაწერებს)

---

## 🛠️ დამატებითი ბრძანებები:

### Manual Registry Check:
```batch
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Run"
```

### Delete Registry Entry (uninstall):
```batch
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v ScannerHelper /f
```

### Stop Service:
```batch
taskkill /F /IM scanner_helper.exe
```

### Check if Running:
```batch
tasklist | findstr scanner_helper
```

### View Log:
```batch
type scanner_helper.log
```

---

## 📁 ფაილები:

### Development:
```
windowsRust\
├── target\release\scanner_helper.exe  ← Main executable
└── Cargo.toml
```

### Production (After First Run):
```
C:\YourPath\
├── scanner_helper.exe          ← Running service
└── scanner_helper.log          ← Log file (auto-created)

Registry:
HKCU\...\Run\ScannerHelper → C:\YourPath\scanner_helper.exe
```

---

## 🐛 Troubleshooting:

### არ რეგისტრირდება Registry-ში

**მიზეზი:** Permissions issue

**გადაწყვეტა:**
```batch
REM Run as Administrator (first time only)
Right-click scanner_helper.exe → "Run as administrator"
```

### Console არ იმალება

**შემოწმება:**
```rust
// Code in main.rs:294
#[cfg(windows)]
hide_console_window();
```

თუ არ მუშაობს, rebuild:
```batch
cargo clean
cargo build --release
```

### Log ფაილი არ იქმნება

**მიზეზი:** Write permissions

**გადაწყვეტა:**
```batch
REM Check folder permissions
icacls scanner_helper.exe

REM Log will be in same folder as .exe
dir scanner_helper.log
```

### ორჯერ რეგისტრირდა

თუ რამე მიზეზით ორჯერ რეგისტრირდა:
```batch
REM View all entries
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Run"

REM Delete duplicate
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v ScannerHelper /f

REM Run scanner_helper.exe again to re-register correctly
```

---

## 🔐 უსაფრთხოება:

### Registry წვდომა:
- ✅ იყენებს `HKEY_CURRENT_USER` (არა `HKEY_LOCAL_MACHINE`)
- ✅ არ საჭიროებს Administrator უფლებებს
- ✅ მხოლოდ მიმდინარე user-ისთვის

### Network:
- ✅ Binds to `127.0.0.1` (localhost only)
- ❌ არ არის ხელმისაწვდომი ქსელიდან
- ✅ უსაფრთხო

---

## 💡 რჩევები:

### 1. Portable Installation:

თუ გინდა რომ სხვადასხვა ადგილიდან გაეშვას:
- ✅ უბრალოდ გადაიტანე .exe სადაც გინდა
- ✅ გაუშვი - ავტომატურად განაახლებს Registry-ში path-ს

### 2. Multiple Instances:

❌ ერთი instance ერთ დროს! თუ ორი გაუშვი:
```
Error: Address already in use (port 8765)
```

### 3. Debug Mode:

თუ გინდა console-ის ნახვა (development):
```rust
// Comment out this line in main.rs:294
// hide_console_window();
```

---

## 📊 შედარება:

### Before (VBS Scripts):
```
❌ საჭიროა დამატებითი ფაილები (.vbs, .bat)
❌ ხელით Install
❌ Registry manual registration
```

### After (Built-in):
```
✅ ერთი .exe ფაილი - საკმარისი!
✅ პირველი გაშვება = ავტომატური რეგისტრაცია
✅ Console დამალვა built-in
✅ არანაირი დამატებითი ფაილები
```

---

## 🎉 შედეგი:

### გამოყენება:

```batch
# 1. Build
cargo build --release

# 2. გადაიტანე სადაც გინდა
copy target\release\scanner_helper.exe C:\MyApps\

# 3. გაუშვი ერთხელ
C:\MyApps\scanner_helper.exe

# 4. ყოველთვის მზადაა!
# - ავტომატურად რეგისტრირებული
# - დამალული
# - Windows login-ზე ავტომატურად გაეშვება
```

---

## 📝 Checklist:

- [ ] Built (`cargo build --release`)
- [ ] Copied to target location
- [ ] Run once
- [ ] Console disappeared ✅
- [ ] Check Task Manager (running) ✅
- [ ] Check Registry (registered) ✅
- [ ] Test browser (working) ✅
- [ ] Reboot
- [ ] Auto-started after login ✅

---

**✅ ყველაფერი ერთ ფაილში - scanner_helper.exe!**

**🚀 გაუშვი ერთხელ და დაივიწყე - ავტომატურად იმუშავებს!**

**🔒 სრულად დამალული, არანაირი manual action!**
