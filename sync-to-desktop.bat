@echo off
chcp 65001 > nul
title Đồng bộ Quản Trị Long Wedding sang Electron Desktop
echo Đang đồng bộ toàn bộ tính năng sang Desktop...
npm run sync:desktop
echo.
pause
