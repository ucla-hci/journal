@echo off
:main
echo Thank you for being a pilot user!
echo 1. Start Journal Editor
echo 2. Start Journal Marker
echo 3. Install (Required before first start)
echo Enter. Quit this script (Default)
set /p choice=Your selection(1/2/3):
if not defined choice set choice=4
if /i "%choice%"=="1" goto EDIT
if /i "%choice%"=="2" goto MARK
if /i "%choice%"=="3" goto INSTALL
if /i "%choice%"=="5" goto main
cls&set choice=&goto main
:INSTALL
call npm install
call cd python
call virtualenv env
call env\Scripts\activate
call pip3 install flask
call pip3 install flask_cors
call cd ../
call deactivate
goto main
:EDIT
start /B run_python.bat
call npm start
start "http://localhost:3000"
pause
:MARK
start /B run_python.bat
start /B run_node.bat
start /B "http://localhost:3000/exp"
pause