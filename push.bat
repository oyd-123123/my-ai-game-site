@echo off
chcp 65001 >nul
echo ======================================
echo 正在提交并推送到 GitHub...
echo ======================================
echo.

git add .
git commit -m "自动更新：%date% %time%"
git push

echo.
echo 完成！按任意键退出……
pause >nul