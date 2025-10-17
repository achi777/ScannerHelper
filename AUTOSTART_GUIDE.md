# 🚀 Windows ავტომატური გაშვება (დამალული რეჟიმი)

## 🎯 რას აკეთებს:

Windows-ის ჩართვისას **ავტომატურად გაეშვება**:
1. ✅ Scanner Helper Service (port 8765)
2. ✅ PHP Web Server (port 8080)

**სრულად დამალული** - არანაირი ფანჯარა არ გამოჩნდება! 🔒

## ⚡ სწრაფი ინსტრუქცია:

### 1. Build პროექტი:
```batch
cargo build --release
```

### 2. Install Startup:
```batch
install_full_startup.bat
```

### 3. გადატვირთე კომპიუტერი:
```batch
shutdown /r /t 0
```

### 4. შემდეგ login-ზე:
- ✅ ყველაფერი ავტომატურად გაეშვება დამალულად
- ✅ გახსენი browser: `http://localhost:8080/index.html`
- ✅ სკანირება მუშაობს!

---

## 📁 ფაილები:

| ფაილი | რას აკეთებს |
|-------|-------------|
| **start_all_hidden.vbs** | ⭐ გაუშვებს ორივე service-ს დამალულად |
| **scanner_service.vbs** | გაუშვებს მხოლოდ Scanner Helper-ს |
| **php_service.vbs** | გაუშვებს მხოლოდ PHP Server-ს |
| **install_full_startup.bat** | 📥 დააინსტალირებს startup-ში |
| **uninstall_full_startup.bat** | 🗑️ წაშლის startup-დან |
| **check_services.bat** | 🔍 შეამოწმებს მუშაობს თუ არა |
| **stop_services.bat** | ⏹️ გააჩერებს services-ს |
| **test_hidden.bat** | 🧪 ტესტი დამალული რეჟიმის |

---

## 🔧 დეტალური ინსტრუქცია:

### ნაბიჯი 1: Build Project

```batch
cd windowsRust
cargo build --release
```

ეს შექმნის: `target\release\scanner_helper.exe`

### ნაბიჯი 2: Install to Startup

**Option A: სრული სერვისი (Scanner + PHP)**
```batch
install_full_startup.bat
```

ან

**Option B: მხოლოდ Scanner Helper**
```batch
install_startup.bat
```

### ნაბიჯი 3: Test (არ არის სავალდებულო)

```batch
REM Test hidden mode
test_hidden.bat

REM Check status
check_services.bat
```

### ნაბიჯი 4: Reboot ან Logout

```batch
REM Reboot
shutdown /r /t 0

REM ან Logout
shutdown /l
```

შემდეგ login-ზე ყველაფერი ავტომატურად გაეშვება!

---

## 🔍 როგორ ვნახო რომ მუშაობს:

### 1. Check Task Manager:
```
Ctrl + Shift + Esc
→ Processes Tab
→ ნახე "scanner_helper.exe" და "php.exe"
```

### 2. Check with Script:
```batch
check_services.bat
```

Output:
```
[RUNNING] scanner_helper.exe is running
[RUNNING] php.exe is running

TCP    127.0.0.1:8765    LISTENING
TCP    127.0.0.1:8080    LISTENING
```

### 3. Test in Browser:
```
http://localhost:8080/index.html
→ Click "Scan Document"
→ უნდა იმუშაოს!
```

---

## ⚙️ როგორ მუშაობს:

### Startup Flow:

```
Windows Login
    ↓
Run: %APPDATA%\...\Startup\scanner_full_service.vbs
    ↓
VBScript executes:
    ├─→ scanner_helper.exe (hidden, window=0)
    └─→ php -S localhost:8080 (hidden, window=0)
    ↓
Services running in background
```

### VBScript Code:

```vbscript
' start_all_hidden.vbs
Set WshShell = CreateObject("WScript.Shell")

' Run scanner_helper.exe hidden (0 = no window)
WshShell.Run "scanner_helper.exe", 0, False

' Run PHP server hidden
WshShell.Run "php -S localhost:8080", 0, False
```

### Startup Location:

```
C:\Users\YourName\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\
└── scanner_full_service.vbs
```

---

## 🛠️ მართვის ბრძანებები:

### Start Services (manual):
```batch
start_all_hidden.vbs
```

### Stop Services:
```batch
stop_services.bat
```

### Check Status:
```batch
check_services.bat
```

### Install to Startup:
```batch
install_full_startup.bat
```

### Uninstall from Startup:
```batch
uninstall_full_startup.bat
```

---

## 🐛 Troubleshooting:

### Services არ გაეშვა login-ზე

**გადაწყვეტა:**
```batch
1. Run: check_services.bat
2. If not running, manually start: start_all_hidden.vbs
3. Check Task Manager for errors
```

### PHP არ არის PATH-ში

**გადაწყვეტა:**
```batch
REM შეცვალე php_service.vbs-ში:
WshShell.Run "C:\path\to\php.exe -S localhost:8080", 0, False
```

### Port უკვე გამოყენებულია

**გადაწყვეტა:**
```batch
REM Check what's using port:
netstat -ano | findstr ":8080"
netstat -ano | findstr ":8765"

REM Kill process:
taskkill /F /PID <PID>
```

### დამალული რეჟიმი არ მუშაობს

**გადაწყვეტა:**
```batch
REM Make sure to run VBS script, not BAT:
start_all_hidden.vbs  ✅
start.bat             ❌ (shows window)
```

---

## 🎯 ფაილების მდებარეობა:

### Development:
```
windowsRust\
├── start_all_hidden.vbs       ← VBS script
├── install_full_startup.bat   ← Install to startup
└── target\release\scanner_helper.exe
```

### Production (After Install):
```
%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\
└── scanner_full_service.vbs   ← Copy of start_all_hidden.vbs
```

---

## 📊 სერვისების სტატუსი:

### Check via Task Manager:
```
1. Open Task Manager (Ctrl+Shift+Esc)
2. Go to "Details" tab
3. Look for:
   - scanner_helper.exe  → Scanner Service
   - php.exe             → Web Server
```

### Check via Command:
```batch
tasklist | findstr "scanner_helper php"
```

Output:
```
scanner_helper.exe    12345 Console    1    15,234 K
php.exe               67890 Console    1     8,456 K
```

---

## 🔐 უსაფრთხოება:

### Firewall Rules:

```batch
REM თუ Windows Firewall აბლოკავს:

REM Allow Scanner Helper:
netsh advfirewall firewall add rule name="Scanner Helper" ^
  dir=in action=allow program="C:\path\to\scanner_helper.exe" enable=yes

REM Allow PHP:
netsh advfirewall firewall add rule name="PHP Server" ^
  dir=in action=allow program="C:\path\to\php.exe" enable=yes
```

### Local Only:

Services bind to `127.0.0.1` (localhost only):
- ✅ მხოლოდ ლოკალური კომპიუტერიდან წვდომა
- ❌ არ არის ხელმისაწვდომი ქსელიდან
- ✅ უსაფრთხო

---

## 💡 რჩევები:

### 1. Auto-update Binary:

თუ rebuild გააკეთე, არ დაგავიწყდეს:
```batch
REM Copy new binary
copy /Y target\release\scanner_helper.exe scanner_helper.exe

REM Restart services
stop_services.bat
start_all_hidden.vbs
```

### 2. Debug Mode:

თუ გინდა ნახო output (არა hidden):
```batch
REM Run normally (with window)
target\release\scanner_helper.exe
php -S localhost:8080
```

### 3. Log Files:

დაამატე logging:
```batch
REM Redirect output to log
scanner_helper.exe > scanner.log 2>&1
```

---

## 📋 Checklist:

- [ ] ✅ Build completed (`cargo build --release`)
- [ ] ✅ Tested manually (`start.bat`)
- [ ] ✅ Tested hidden mode (`test_hidden.bat`)
- [ ] ✅ Installed to startup (`install_full_startup.bat`)
- [ ] ✅ Rebooted / Logged out
- [ ] ✅ Services auto-started after login
- [ ] ✅ Browser test successful (`http://localhost:8080/index.html`)
- [ ] ✅ Scan test successful

---

## 🎉 შედეგი:

### Before:
```
❌ ხელით უნდა გაეშვა scanner_helper.exe
❌ ხელით უნდა გაეშვა php -S localhost:8080
❌ ორივე ფანჯარა ეკრანზე
```

### After:
```
✅ ავტომატურად გაეშვება Windows login-ზე
✅ სრულად დამალული (არანაირი ფანჯარა)
✅ მუდამ მზად არის სკანირებისთვის
```

---

## 📞 დამატებითი ინფორმაცია:

**ყველაფერი მუშაობს ფონურად!**

თუ გინდა წაშლა:
```batch
uninstall_full_startup.bat
stop_services.bat
```

---

**🎉 ახლა სკანერი ავტომატურად გაეშვება და დამალულად იმუშავებს!**
