@echo OFF

echo ========================================
echo == HelixJS - Installing Node ==
echo ========================================

echo This batch file will install:
echo  * Chocolately (http://chocolatey.org/)
echo  * NodeJs w/ npm (http://nodejs.org/)

PING 1.1.1.1 -n 1 -w 1000 >NUL

@powershell -NoProfile -ExecutionPolicy unrestricted -Command "iex ((new-object net.webclient).DownloadString('http://bit.ly/psChocInstall'))" && SET PATH=%PATH%;%systemdrive%\chocolatey\bin
@cinst NodeJs.install