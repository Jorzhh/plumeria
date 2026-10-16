@echo off
chcp 65001 > nul
title Laboratorio Bioinformático de Cultivo - Práctica 05
echo ============================================================
echo   LABORATORIO BIOINFORMÁTICO DE CULTIVO (PRÁCTICA 05)
echo   Three.js + FlightPHP REST API + MySQL 8 + Chart.js
echo ============================================================
echo.

:: 1. Verificar PHP en XAMPP o PATH
set PHP_BIN=C:\xampp\php\php.exe
if not exist "%PHP_BIN%" (
    where php >nul 2>&1
    if %errorlevel% equ 0 (
        set PHP_BIN=php
    ) else (
        echo [ERROR] No se encontró PHP en C:\xampp\php\php.exe ni en el PATH.
        echo Por favor instala XAMPP o PHP 8+.
        pause
        exit /b 1
    )
)

echo [1/3] Iniciando API REST FlightPHP en http://localhost:8080 ...
start "BioLab API REST (Puerto 8080)" /min "%PHP_BIN%" -S localhost:8080 -t "%~dp0api" "%~dp0api\index.php"

echo [2/3] Iniciando Servidor Frontend en http://localhost:3000 ...
start "BioLab Frontend (Puerto 3000)" /min "%PHP_BIN%" -S localhost:3000 -t "%~dp0public"

echo [3/3] Abriendo navegador web...
timeout /t 2 > nul
start http://localhost:3000

echo.
echo ============================================================
echo   ✓ SERVIDORES EN EJECUCIÓN
echo   • Frontend:  http://localhost:3000
echo   • API REST:  http://localhost:8080/api/especies
echo ============================================================
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
