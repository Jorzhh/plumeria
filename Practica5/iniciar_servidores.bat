@echo off
setlocal
title BioLab 3D - Practica 05

set "PROJECT_DIR=%~dp0"
set "PHP_BIN=C:\xampp\php\php.exe"

if not exist "%PROJECT_DIR%public\index.html" goto project_missing
if not exist "%PROJECT_DIR%api\index.php" goto api_missing
if exist "%PHP_BIN%" goto php_ready

where.exe php >nul 2>&1
if errorlevel 1 goto php_missing
set "PHP_BIN=php"

:php_ready
echo Iniciando BioLab 3D desde:
echo %PROJECT_DIR%
echo.
echo Iniciando API PHP para la red local en el puerto 8080 ...
start "BioLab API REST - puerto 8080" /min "%PHP_BIN%" -S 0.0.0.0:8080 -t "%PROJECT_DIR%api" "%PROJECT_DIR%api\index.php"

echo Iniciando sitio web para la red local en el puerto 3000 ...
start "BioLab Frontend - puerto 3000" /min "%PHP_BIN%" -S 0.0.0.0:3000 -t "%PROJECT_DIR%public"

echo Esperando a los servidores...
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo El proyecto debe abrirse en http://localhost:3000
echo Para otro equipo de la misma red, usa http://IP-DE-ESTA-PC:3000
echo No abras public\index.html directamente como archivo.
echo Si el navegador no abre, copia esa direccion y pegala manualmente.
echo.
pause
exit /b 0

:php_missing
echo [ERROR] No se encontro PHP.
echo Busca php.exe en C:\xampp\php o agrega PHP al PATH de Windows.
pause
exit /b 1

:project_missing
echo [ERROR] No se encontro public\index.html en:
echo %PROJECT_DIR%
echo Ejecuta este archivo desde la carpeta raiz de Practica 5.
pause
exit /b 1

:api_missing
echo [ERROR] No se encontro api\index.php en:
echo %PROJECT_DIR%
echo Verifica que la carpeta del proyecto este completa.
pause
exit /b 1
