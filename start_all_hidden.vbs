' Start both Scanner Helper and PHP Server hidden
' This is the main startup script

Set WshShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get script directory
strScriptPath = WScript.ScriptFullName
strScriptDir = objFSO.GetParentFolderName(strScriptPath)

' Path to scanner_helper.exe
strExePath = strScriptDir & "\target\release\scanner_helper.exe"
If Not objFSO.FileExists(strExePath) Then
    strExePath = strScriptDir & "\scanner_helper.exe"
End If

' 1. Start Scanner Helper (hidden)
If objFSO.FileExists(strExePath) Then
    WshShell.Run """" & strExePath & """", 0, False
    WScript.Sleep 2000  ' Wait 2 seconds
End If

' 2. Start PHP Server (hidden)
WshShell.CurrentDirectory = strScriptDir
WshShell.Run "php -S localhost:8080", 0, False

' Cleanup
Set WshShell = Nothing
Set objFSO = Nothing
