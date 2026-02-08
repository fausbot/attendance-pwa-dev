@echo off
echo Iniciando Sistema de Control de Entrada...
echo Por favor espere mientras se inicia el servidor web.
echo Si no se abre automaticamente, vaya a http://localhost:5173
cd /d "%~dp0"
call npm run dev
pause
