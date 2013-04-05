@echo OFF

echo ========================================
echo == HelixJS - Installing Node.js ==
echo ========================================

echo This batch file will install:
echo  * Chocolately (http://chocolatey.org/)
echo  * Node.js with npm (http://nodejs.org/)
echo.

REM Wait for a second to allow cancelling before it starts
PING 1.1.1.1 -n 1 -w 1000 >NUL

@powershell -NoProfile -ExecutionPolicy Unrestricted -Command "iex ((new-object net.webclient).DownloadString('http://bit.ly/psChocInstall'))" && SET PATH=%PATH%;%systemdrive%\chocolatey\bin
@cinst NodeJs.install

echo The PATH environment variable was updated to include the location of Node.js. Broadcast the change to prevent reboot or sign out/sign in.

@powershell -NoProfile -ExecutionPolicy Unrestricted -File "Invoke-WMSettingsChange.ps1"