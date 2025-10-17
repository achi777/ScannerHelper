# ⚡ სწრაფი დაწყება - განახლებული სკანერი

## 🎯 რა შეიცვალა?

**❌ წინ:** 1 პიქსელი (ლურჯი წერტილი)
**✅ ახლა:** 2480x3508 პიქსელი (სრული A4 დოკუმენტი @ 300 DPI)

## 🚀 3 ნაბიჯი:

### 1️⃣ Build (Windows):
```batch
cd windowsRust
cargo build --release
```

### 2️⃣ Run:
```batch
target\release\scanner_helper.exe
```

### 3️⃣ Test:
```batch
REM ახალ terminal-ში:
php -S localhost:8080

REM Browser:
http://localhost:8080/index.html
```

## ✅ შედეგი:

Click "**Scan Document**" → მიიღებ **სრულ A4 დოკუმენტს**!

- 📐 **ზომა:** 2480 x 3508 პიქსელი
- 🎯 **DPI:** 300
- 🎨 **ფერი:** 24-bit RGB
- 💾 **Size:** ~26 MB

## 📊 რას ნახავ:

```
████████████        ████████████
████████████        ████████████

████████████        ████████████
████████████        ████████████
```

დოკუმენტი რომელზეც არის ტექსტის სიმულაცია (შავი ზოლები).

## 🔧 პარამეტრების შეცვლა:

თუ გინდა **პატარა ფაილი**, შეცვალე `src/main.rs:113-114`:

```rust
// 150 DPI (6.5 MB instead of 26 MB)
let width: i32 = 1240;
let height: i32 = 1754;
```

## 📝 დოკუმენტაცია:

- **README_UPGRADE.md** - სრული ინსტრუქცია
- **UPGRADE_NOTES.md** - ტექნიკური დეტალები
- **SCAN_UPGRADE.md** - BMP ფორმატი
- **FIXED.md** - Build errors fix

## 💡 Tip:

Server log-ში ნახავ:
```
[SUCCESS] Generated 2480x3508 document (25434 KB)
```

თუ ნახე `(25434 KB)` → ✅ **ყველაფერი კარგად მუშაობს!**

---

**🎉 Ready to scan!**
