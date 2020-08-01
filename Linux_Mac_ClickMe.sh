#! /bin/bash

echo "Thank you for being a pilot user!"

while :
do
    echo "1. Start Journal Editor"
    echo "2. Start Journal Marker"
    echo "3. Install (Required before first start)"
    echo "Enter. Quit this script (Default)"
    read -p "Your selection[1/2/3]: " input

    case $input in
        [3]*)
            npm install
            cd ./python
            virtualenv journey
            source journey/bin/activate
            pip3 install flask
            pip3 install flask_cors
            deactivate
            ;;
        [2]*)
            open http://localhost:3000/exp
            sudo npm start &
            cd ./python
            source journey/bin/activate
            python3 app.py
            ;;
        [1]*)
            open http://localhost:3000/
            sudo npm start &
            cd ./python
            source journey/bin/activate
            python3 app.py
            ;;
        *)
            break
            ;;
    esac
done