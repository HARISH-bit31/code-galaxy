@echo off
echo ============================================
echo        Code Galaxy - Dependency Installer
echo ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js found: 
node --version
echo.

:: Install Backend dependencies
echo [1/3] Installing Backend dependencies...
echo --------------------------------------------
cd /d "%~dp0backend"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Backend dependencies!
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed successfully.
echo.

:: Install React Frontend dependencies
echo [2/3] Installing React Frontend dependencies...
echo --------------------------------------------
cd /d "%~dp0react-frontend"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install React Frontend dependencies!
    pause
    exit /b 1
)
echo [OK] React Frontend dependencies installed successfully.
echo.

:: Install Angular Frontend dependencies
echo [3/3] Installing Angular Frontend dependencies...
echo --------------------------------------------
cd /d "%~dp0angular-frontend"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Angular Frontend dependencies!
    pause
    exit /b 1
)
echo [OK] Angular Frontend dependencies installed successfully.
echo.

echo ============================================
echo   All dependencies installed successfully!
echo ============================================
echo.
echo To run the project:
echo   Backend:          cd backend ^& npm start
echo   React Frontend:   cd react-frontend ^& npm run dev
echo   Angular Frontend: cd angular-frontend ^& npm start
echo.
pause
