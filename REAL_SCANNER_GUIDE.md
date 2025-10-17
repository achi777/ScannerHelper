# 🔧 რეალური სკანერის ინტეგრაცია

## ⚠️ მიმდინარე სიტუაცია

Rust `windows-rs` crate-ს აქვს WIA API bindings, მაგრამ სრული იმპლემენტაცია რთულია რადგან საჭიროებს:
1. COM interface callbacks (IWiaTransferCallback)
2. Complex property storage handling
3. Stream-based data transfer
4. Manual memory management

## ✅ რეკომენდებული გადაწყვეტა

### Option 1: გამოიყენე C++ ვერსია (უმარტივესი!)

```batch
cd windows
build.bat
start.bat
```

C++ ვერსია **უკვე მუშაობს** რეალურ სკანერთან და აქვს სრული WIA იმპლემენტაცია!

### Option 2: Hybrid Approach (Rust + C++ DLL)

1. **Build C++ როგორც DLL:**
```cpp
// scanner_wia.dll - WIA functionality only
__declspec(dllexport) unsigned char* ScanDocument(int* size);
```

2. **Call from Rust:**
```rust
#[link(name = "scanner_wia")]
extern "C" {
    fn ScanDocument(size: *mut i32) -> *mut u8;
}
```

### Option 3: PowerShell Script (ყველაზე სწრაფი!)

შექმენი `scan.ps1`:
```powershell
$deviceManager = new-object -ComObject WIA.DeviceManager
$device = $deviceManager.DeviceInfos.Item(1).Connect()

foreach ($item in $device.Items) {
    if ($item.ItemID -like "*Flatbed*") {
        $image = $item.Transfer()
        $image.SaveFile("C:\temp\scan.bmp")
        break
    }
}
```

Rust-დან გაუშვი:
```rust
let output = Command::new("powershell")
    .args(&["-File", "scan.ps1"])
    .output()?;

// Read scanned file
let data = std::fs::read("C:\\temp\\scan.bmp")?;
```

## 🚀 სწრაფი გადაწყვეტა PowerShell-ით

