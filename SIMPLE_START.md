# ⚡ მარტივი გაშვება - 2 ნაბიჯი

## 🎯 რას აკეთებს:

scanner_helper.exe **თავად** აკეთებს ყველაფერს:
- ✅ Console-ს ამალავს
- ✅ Registry-ში რეგისტრირდება
- ✅ Windows startup-ში ემატება
- ✅ Log ფაილს ქმნის

**არანაირი დამატებითი ფაილები არ არის საჭირო!**

---

## 🚀 გამოყენება:

### 1️⃣ Build:
```batch
cargo build --release
```

### 2️⃣ გაუშვი:
```batch
target\release\scanner_helper.exe
```

**ეს ყველაფერი!** 🎉

---

## ✅ რა მოხდება:

1. Console ფანჯარა **მაშინვე გაქრება**
2. Registry-ში **დარეგისტრირდება**
3. Service **background-ში გაეშვება**
4. Scanner **მზად არის**: `http://localhost:8080/index.html`

---

## 🔄 შემდეგი რებუთის შემდეგ:

- ✅ **ავტომატურად გაეშვება**
- ✅ **დამალული**
- ✅ **მუდამ მზად არის**

---

## 🔍 როგორ შევამოწმო:

### Task Manager:
```
Ctrl + Shift + Esc
→ ნახე "scanner_helper.exe"
```

### Registry:
```batch
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v ScannerHelper
```

### Browser Test:
```
http://localhost:8080/index.html
→ Click "Scan Document"
```

---

## 🛑 როგორ გავაჩერო:

### Stop Service:
```batch
taskkill /F /IM scanner_helper.exe
```

### Remove from Startup:
```batch
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v ScannerHelper /f
```

---

## 📁 ფაილები:

### საჭირო:
```
scanner_helper.exe  ← მხოლოდ ეს ერთი!
```

### ავტომატურად შეიქმნება:
```
scanner_helper.log  ← Log ფაილი (optional)
```

---

## 💡 Tips:

### გადატანა:
```batch
REM გადაიტანე სადაც გინდა და გაუშვი:
copy scanner_helper.exe C:\MyApps\
C:\MyApps\scanner_helper.exe

REM ავტომატურად განაახლებს Registry-ში path-ს!
```

### Debug:
```batch
REM Log-ის ნახვა:
type scanner_helper.log
```

---

**✅ ყველაფერი ავტომატური!**

**🎉 ერთი .exe - ყველაფერი რაც გჭირდება!**

**📖 დეტალებისთვის იხ:** [AUTO_REGISTER_GUIDE.md](AUTO_REGISTER_GUIDE.md)
