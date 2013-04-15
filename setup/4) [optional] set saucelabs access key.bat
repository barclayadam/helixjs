@echo off

echo ========================================
echo == HelixJS - SauceLabs Access Key ==
echo ========================================

set /p saucekey="Enter SauceLabs Access Key: " %=%

SetX SAUCE_ACCESS_KEY %saucekey% /m

echo Complete
pause