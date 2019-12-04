## Assisted Journaling (name TBD)
This repository tracks the development of an interactive journal intended to increase the benefits of expressive writing for a user by subtly helping them introspect on their words. Our project will automatically work with the user to help them reframe their thoughts, via the experience of collaboratively editing a journal entry alongside an artificially intelligent, guilding other.

### Test Frontend
- open `Web-Notepad.html`
- type!

### Test Frontend + Backend
Dependencies: `flask`, `textblob`, `empath`, `fuzzywuzzy`, 
- `cd` to `python` folder
- `source venv/bin/activate` to activate virtual environment (Necessary for importing `textblob` lib in Python)
- run backend server by using command `python3 app.py`
- make sure Flask is running on `127.0.0.1:5000`, otherwise you need to modify ip setting in `js/journal.js` first
- open `Web-Notepad.html`
- type!

#### Attention
CORS needs to be disabled if the project is being run locally. In Safari, under `Develop` toggle `Disable Local File Restrictions`
On a PC, try https://alfilatov.com/posts/run-chrome-without-cors/
