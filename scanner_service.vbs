' Scanner Helper Service - Hidden Startup Script
' This script runs scanner_helper.exe silently in the background

Set WshShell = CreateObject("WScript.Shell")

' Get script directory
strScriptPath = WScript.ScriptFullName
Set objFSO = CreateObject("Scripting.FileSystemObject")
strScriptDir = objFSO.GetParentFolderName(strScriptPath)

' Path to scanner_helper.exe
strExePath = strScriptDir & "\target\release\scanner_helper.exe"

' Check if exe exists
If Not objFSO.FileExists(strExePath) Then
    ' Try current directory
    strExePath = strScriptDir & "\scanner_helper.exe"
End If

' Run hidden (0 = hidden window)
WshShell.Run """" & strExePath & """", 0, False

' Cleanup
Set WshShell = Nothing
Set objFSO = Nothing
