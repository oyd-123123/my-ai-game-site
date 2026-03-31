$ngrokPath = "C:\Users\86136\AppData\Local\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"
$logPath = "D:\my-ai-game-site\ngrok.log"

# 启动 Ngrok 并保持运行
& $ngrokPath http 9090 | Tee-Object -FilePath $logPath

# 如果进程退出，等待 5 秒后重启
while ($true) {
    Start-Sleep -Seconds 5
    & $ngrokPath http 9090 | Tee-Object -FilePath $logPath -Append
}
