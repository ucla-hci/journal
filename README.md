## Assisted Journaling
Our Assisted Journaling project is motivated by the therapeutic practice of expressive journaling to manage one's depressive or anxious thoughts. This repository tracks the development of an interactive journal intended to increase the benefits of expressive writing for a user by subtly helping them introspect on their words. Our final product will eventually automatically work with the user to help them reframe their thoughts, via the experience of collaboratively editing a journal entry alongside an artificially intelligent, guilding other. Inspired by cognitive behavioral therapy, we will approach this problem by identifying congitive distrotions present in the user's writing, and provide undistorted tranlsation. 

So far, we have implemented basic sentiment analysis, and a simple cognitive distortion detector. We are in the process of gathering real data to build a more nuanced cognitive distortion detector before we can build a model for thought-reframing.

### Features
* Asking the user a question to get them in the headspace of journaling. This feature can become more customized and intelligent in the future. 

![Welcome_Question](/screenshots/screenshot1.png)

![Welcome_Question2](/screenshots/screenshot2.PNG)

* Underlining words associated with positive (green) or negative (red) connotation, so that the user can determine their level of positivity/negativity and also make connections about what subjects contribute to these sentiments. Underlined words can also be selected to show related subjects. 

* Autosuggest based on MIT's Eliza that will rephrase parts of the user's input to encourage further introspection. This will be more intelligent in the future.

![Sentiment](/screenshots/screenshot3.PNG)

* Detecting four different cognitive distortions. This will be more intelligent in the future.

    * Splitting

    ![Splitting](/screenshots/screenshot4.PNG)

    * Blaming

    ![Splitting](/screenshots/screenshot5.PNG)

    * Fortune-telling

    ![Splitting](/screenshots/screenshot6.PNG)

    * Using "Should" Statements
    
    ![Splitting](/screenshots/screenshot7.PNG)







### Test Frontend
- open `Web-Notepad.html`
- type!

### Test Frontend + Backend
Dependencies: `flask`, `textblob`, `empath`, `eliza_utils`
- `cd` to `python` folder
- `source venv/bin/activate` to activate virtual environment (Necessary for importing `textblob` lib in Python)
- run backend server by using command `python3 app.py`
- make sure Flask is running on `127.0.0.1:5000`, otherwise you need to modify ip setting in `js/journal.js` first
- open `Web-Notepad.html`
- type!

#### Attention
CORS needs to be disabled if the project is being run locally. In Safari, under `Develop` toggle `Disable Local File Restrictions`
On a PC, try https://alfilatov.com/posts/run-chrome-without-cors/

#### Resources
Sentiment analysis on a sentence was performed using a combination of the TextBlob library, https://textblob.readthedocs.io/en/dev/, and empath library, https://github.com/Ejhfast/empath-client.
The Eliza implementation for autosuggest was based entirely on this repo: https://github.com/wadetb/eliza/.
