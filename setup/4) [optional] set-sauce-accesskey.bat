@echo off
set /p saucekey="Enter SauceLabs Access Key: " %=%

SetX SAUCE_ACCESS_KEY %saucekey% /m