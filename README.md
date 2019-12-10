# Assisted Journaling
Our Assisted Journaling project is motivated by the therapeutic practice of expressive journaling to manage one's depressive or anxious thoughts. This repository tracks the development of an interactive journal intended to increase the benefits of expressive writing for a user by subtly helping them introspect on their words. Our final product will eventually automatically work with the user to help them reframe their thoughts, via the experience of collaboratively editing a journal entry alongside an artificially intelligent, guilding other. Inspired by cognitive behavioral therapy, we will approach this problem by identifying congitive distrotions present in the user's writing, and provide undistorted tranlsation. 

So far, we have implemented basic sentiment analysis, and a simple cognitive distortion detector. We are in the process of gathering real data to build a more nuanced cognitive distortion detector before we can build a model for thought-reframing.

## Dependencies
Lib needed: `flask`, `textblob`, `empath`, `eliza_utils`, `fuzzywuzzy`
Especially, to enable `flask`, 'venv' is required. Follow these steps:
- `cd` to `python` folder
- `python3 -m venv venv` to build dir
- `source venv/bin/activate` to activate virtual environment (Windows-Powershell command: `py -3 -m venv venv`)
- `pip install xxxx` to install all dependencies

## Test Frontend Only
- open `Web-Notepad.html`
- Type!
- Note that features like Highlight and Underline are not available without backend

## Test Frontend + Backend
- run backend server by using command `python3 app.py`
- make sure `Flask` is running on `127.0.0.1:5000`, otherwise you need to modify ip setting in `js/journal.js` first
- open `Web-Notepad.html`
- Type!

### Attention
CORS needs to be disabled if the project is being run locally. In Safari, under `Develop` toggle `Disable Local File Restrictions`
On a PC, try https://alfilatov.com/posts/run-chrome-without-cors/

### Resources
Sentiment analysis on a sentence was performed using a combination of the TextBlob library, https://textblob.readthedocs.io/en/dev/, and empath library, https://github.com/Ejhfast/empath-client.
The Eliza implementation for autosuggest was based entirely on this repo: https://github.com/wadetb/eliza/.
