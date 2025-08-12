@echo off
echo Building DevOps Dashboard Application...

:: Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found. Please run this script from the devops_app directory.
    exit /b 1
)

:: Install dependencies
echo Installing root dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install root dependencies
    exit /b 1
)

:: Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install --production
if %ERRORLEVEL% neq 0 (
    echo Failed to install backend dependencies
    exit /b 1
)
cd ..

:: Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install --include=dev
if %ERRORLEVEL% neq 0 (
    echo Failed to install frontend dependencies
    exit /b 1
)

:: Build frontend
echo Building frontend for production...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Frontend build failed!
    exit /b 1
)

:: Check if build was successful
if exist "dist\index.html" (
    echo ✅ Frontend build successful!
    echo Build files are in: frontend\dist\
    dir dist
) else (
    echo ❌ Frontend build failed - dist folder not created
    exit /b 1
)

cd ..

echo.
echo ✅ Build completed successfully!
echo You can now deploy the application or run it locally with: npm start 