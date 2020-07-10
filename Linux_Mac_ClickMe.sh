#! /bin/bash

echo "Thank you for choosing Smart Reporting System"

start(){
    echo "1. Start (Default)"
    echo "2. Install (Required before first start)"
    read -p "Your selection[1/2]: " input

    case $input in
        [2]*)
            npm install
            cd ./python
            virtualenv journey
            source journey/bin/activate
            pip3 install textblob
            pip3 install flask
            pip3 install flask_cors
            pip3 install ibm_watson
            pip3 install empath
            deactivate
            ;;
        [1]*)
            open ./index.html
            cd ./python
            source journey/bin/activate
            python3 app.py
            ;;
        *)
            npm start
            ;;
    esac
}
start
