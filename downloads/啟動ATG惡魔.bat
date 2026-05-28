@echo off
chcp 65001 >nul
cd /d "%~dp0"
python atg_demon.py
if errorlevel 1 (
  py -3 atg_demon.py
)
pause
