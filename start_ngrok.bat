@echo off
set NGROK=C:\Users\86136\AppData\Local\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe
"%NGROK%" http 9090 --log=D:\my-ai-game-site\ngrok.log --log-format=json
