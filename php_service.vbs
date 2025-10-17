' PHP Server Service - Hidden Startup Script
' This script runs PHP server silently in the background

Set WshShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get script directory
strScriptPath = WScript.ScriptFullName
strScriptDir = objFSO.GetParentFolderName(strScriptPath)

' Change to project directory
WshShell.CurrentDirectory = strScriptDir

' Run PHP server hidden (0 = hidden window)
' php -S localhost:8080
WshShell.Run "php -S localhost:8080", 0, False

' Cleanup
Set WshShell = Nothing
Set objFSO = Nothing
