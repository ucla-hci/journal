## About & Summary

This branch is built for showing basic ideas of Project Esspresso.
The front-end is a simple webapp that allow plain text editing.
In the sidebar, supported API functions were packaged as buttons.
To run demo, both frontend and backend need to be set up. Check following instructions.
### Sentiment, Emotion, Category: 
Using Watson API to do classification.
### LIWC:
Using LIWC Dictionary to do counting.
### Cursor:
Frontend development helper

## Demo Set Up
### Frontend
```
npm install
npm start

```

### Backend
#### Method 1 (Script Automation): 
	Use "Linux_Mac_ClickMe.sh"

#### Method 2 (Manual Steps):
	At root dir, use "npm install" command to install all JavaScript dependencies.

	At python dir, install Python dependencies manually: 
	(Python 3.x is necessary)
		pip3 install textblob
		pip3 install flask
		pip3 install flask_cors
		pip3 install ibm_watson
		pip3 install empath
	Then, use "python3 app.py" command to run backend server.

	Finally, open index.html in  browser to start testing.

## License
MIT
