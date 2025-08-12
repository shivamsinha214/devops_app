@if "%SCM_TRACE_LEVEL%" NEQ "4" @echo off

:: ----------------------
:: KUDU Deployment Script
:: Version: 1.0.17
:: ----------------------

:: Prerequisites
:: -------------

:: Verify node.js installed
where node 2>nul >nul
IF %ERRORLEVEL% NEQ 0 (
  echo Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment.
  goto error
)

:: Setup
:: -----

setlocal enabledelayedexpansion

SET ARTIFACTS=%~dp0%..\artifacts

IF NOT DEFINED DEPLOYMENT_SOURCE (
  SET DEPLOYMENT_SOURCE=%~dp0%.
)

IF NOT DEFINED DEPLOYMENT_TARGET (
  SET DEPLOYMENT_TARGET=%ARTIFACTS%\wwwroot
)

IF NOT DEFINED NEXT_MANIFEST_PATH (
  SET NEXT_MANIFEST_PATH=%ARTIFACTS%\manifest

  IF NOT DEFINED PREVIOUS_MANIFEST_PATH (
    SET PREVIOUS_MANIFEST_PATH=%ARTIFACTS%\manifest
  )
)

IF NOT DEFINED KUDU_SYNC_CMD (
  :: Install kudu sync
  echo Installing Kudu Sync
  call npm install kudusync -g --silent
  IF !ERRORLEVEL! NEQ 0 goto error

  :: Locally just running "kuduSync" would also work
  SET KUDU_SYNC_CMD=%appdata%\npm\kuduSync.cmd
)

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Deployment
:: ----------

echo Handling node.js deployment.

:: 1. KuduSync
IF /I "%IN_PLACE_DEPLOYMENT%" NEQ "1" (
  call :ExecuteCmd "%KUDU_SYNC_CMD%" -v 50 -f "%DEPLOYMENT_SOURCE%" -t "%DEPLOYMENT_TARGET%" -n "%NEXT_MANIFEST_PATH%" -p "%PREVIOUS_MANIFEST_PATH%" -i ".git;.hg;.deployment;deploy.cmd"
  IF !ERRORLEVEL! NEQ 0 goto error
)

:: 2. Install npm packages for backend
echo Installing backend dependencies...
IF EXIST "%DEPLOYMENT_TARGET%\backend\package.json" (
  pushd "%DEPLOYMENT_TARGET%\backend"
  call :ExecuteCmd npm install --production
  IF !ERRORLEVEL! NEQ 0 goto error
  popd
) ELSE (
  echo Warning: backend\package.json not found
)

:: 3. Install npm packages for frontend and build
echo Installing frontend dependencies and building...
IF EXIST "%DEPLOYMENT_TARGET%\frontend\package.json" (
  pushd "%DEPLOYMENT_TARGET%\frontend"
  echo Installing frontend dependencies...
  call :ExecuteCmd npm install --include=dev
  IF !ERRORLEVEL! NEQ 0 goto error
  
  echo Building frontend for production...
  call :ExecuteCmd npm run build
  IF !ERRORLEVEL! NEQ 0 (
    echo Frontend build failed!
    goto error
  )
  
  echo Checking if build succeeded...
  IF EXIST "dist\index.html" (
    echo Frontend build successful - dist folder created
  ) ELSE (
    echo Frontend build failed - dist folder not found
    goto error
  )
  popd
) ELSE (
  echo Warning: frontend\package.json not found
)

:: 4. Install root npm packages
echo Installing root dependencies...
IF EXIST "%DEPLOYMENT_TARGET%\package.json" (
  pushd "%DEPLOYMENT_TARGET%"
  call :ExecuteCmd npm install --production
  IF !ERRORLEVEL! NEQ 0 goto error
  popd
) ELSE (
  echo Warning: root package.json not found
)

:: 5. Set NODE_ENV to production
echo Setting NODE_ENV=production
set NODE_ENV=production

echo Deployment completed successfully!

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
goto end

:: Execute command routine that will echo out when error
:ExecuteCmd
setlocal
set _CMD_=%*
call %_CMD_%
if "%ERRORLEVEL%" NEQ "0" echo Failed exitCode=%ERRORLEVEL%, command=%_CMD_%
exit /b %ERRORLEVEL%

:error
endlocal
echo An error has occurred during web site deployment.
call :exitSetErrorLevel
call :exitFromFunction 2>nul

:exitSetErrorLevel
exit /b 1

:exitFromFunction
()

:end
endlocal
echo Finished successfully. 