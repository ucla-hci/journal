#############################################
######### NOTES
#############################################
    # dependencies: empath, textblob
    # pip install textblob, empath

    # Usage: pass in a sentence into the get_output() method in order to generate the "auto-suggestion" to display to the journal.
    # Three different outputs:
        # encourage user's constructive input
        # address user's dysfunctional thinking (displays of low-self esteem)
        # address user's congnitive distortion (all-or-nothing thinking)
    # Run the main function for examples.

    # Limitations:
        # The functions are designed to perform simple analysis on simple sentences.
        # I have not implented polarity analysis yet. Trying to find a more sophisticated method.
        # I would like to make the output for specific to the user's input in the future.

from textblob import TextBlob
from textblob import Word
from empath import Empath

constructive = ['help', 'better', 'improve', 'practice', 'workon', 'understand', 'analyze', 'plan', 'change', 'try']
dysfunctional = ['loser', 'suck', 'hate', 'lazy', 'theworst', 'useless', 'failure', 'pathetic', 'good-for-nothing', 'dumb', 'stupid']
trigger = ['cannot', 'ca', 'always', 'never', 'ever', 'must', 'mustnot', 'should', 'shouldnot', 'haveto', 'orelse', 'every', 'everything', 'nothing', 'anything', 'all', 'none', 'any', 'atall', 'everybody', 'nobody', 'anybody', 'noone', 'only']
pronoun = ['i', 'me', 'my', 'myself']

def pre_process(str):
    # lowercase
    str = str.lower()

    tb = TextBlob(str)
    temp = tb.tags
    temp2 = list(map(list, zip(*temp)))
    words = temp2[0] # extract individual words from sentence
    original = words
    pos = temp2[1] # extract parts of speech of words

    for w, p, i in zip(words, pos, range(len(words))):
        wrd = Word(w)
        if (p[0] == 'N'):
            words[i] = wrd.lemmatize('n')
        elif (p[0] == 'A'):
            words[i] = wrd.lemmatize('a')
        elif (p[0] == 'V'):
            words[i] = wrd.lemmatize('v')
        elif (p[0] == 'R'):
            words[i] = wrd.lemmatize('r')

    # combine key phrases into single word
    # "work on", "the worst", "cannot", "must not", "should not", "have to", "or else", "at all", "no one"
    for i in range(len(words)):
        if(i + 1 != len(words)):
            if (words[i] == 'work' and words[i + 1] == 'on'):
                words[i] = 'workon'
            if (words[i] == 'the' and words[i + 1] == 'worst'):
                words[i] = 'theworst'
            if (words[i] == 'have' and words[i + 1] == 'to'):
                words[i] = 'haveto'
            if (words[i] == 'or' and words[i + 1] == 'else'):
                words[i] = 'orelse'

    return original, words, pos

def get_polarity(str):
    tb = TextBlob(str)
    return [tb.sentiment, tb.sentiment.polarity]

def auto_suggest(words, pos, sent):
    str = None
    const = []
    dys = []
    trig = []
    num_pronoun = []
    contraction = ['ca', 'should', 'must']

    for i in range(len(words)):
        for c in constructive:
            if (words[i] == c):
                const.append(words[i])
        for d in dysfunctional:
            if (words[i] == d):
                dys.append(words[i])
        for t in trigger:
            if (words[i] == t):
                trig.append(words[i])
        for p in pronoun:
            if (words[i] == p):
                num_pronoun.append(words[i])

    if (len(trig) > len(const) and len(trig) > len(dys)):
        # 2 counts of trigger words
        # 1 count of pronoun
        # negative sentiment
        if (len(trig) >= 2 and len(num_pronoun) >= 1):
            str = "I am sorry to hear this. :( Why do you feel this way? Can you think of a more constructive way to understand the situation?"
    elif (len(const) > len(trig) or len(const) > len(dys)):
        # pronoun ... >=1 constructive word ... pronoun
        i_before = 0 # pronouns before constructive word
        encounter = False # encounter constructive word
        i_after = 0 # pronouns after constructive word
        for w in words:
            for c in const:
                if (w == c and encounter == False):
                    encounter = True
            for p in num_pronoun:
                if (w == p and encounter == False):
                    i_before += 1
                if (w == p and encounter == True):
                    i_after += 1

        if (i_before >= 1 and len(const) >= 1 and i_after >= 1): #constructive output
            str = "I am happy to hear that! What steps can you take, or are you taking, to apply the growth mindset in this area?"

    elif (len(dys) > len(const) and len(dys) > len(trig)): #dysfunctional output
        # pronoun ... feel, be, 'm (am) ... >= dysfunctional word
        i_before = 0 # pronouns before dysfunctional word
        encounter = False # encounter dysfunctional word
        verb = 0 # verbs before dysfunction word

        for w in words:
            for d in dys:
                if (w == d and encounter == False):
                    encounter = True
            for p in num_pronoun:
                if (w == p and encounter == False):
                    i_before += 1
            if (w == 'be' or w == 'feel' or w == '\'m'):
                if (i_before > 0 and encounter == False):
                    verb += 1
        if (i_before >= 1 and verb >= 1 and encounter == True):
            str = "I am sorry to hear this. :( Why do you feel this way? What actions can you take to address this underlying situation?"

    elif (len(trig) == len(dys) and len(trig) > len(const) and len(num_pronoun) >= 1): #trigger ouput
        str = "I am sorry to hear this. :( Why do you feel this way? Can you think of a more constructive way to understand the situation?"

    return str

# call this function to retrieve output
def get_output(sent):
    original, words, pos = pre_process(sent)
    pol = get_polarity(" ".join(words))
    str = auto_suggest(words, pos, pol)
    return str

def main():
    sentences = ["I am practicing my conversational skills.", "I am a useless human being.", "Nobody ever thinks of me first."]
    for sent in sentences:
        str = get_output(sent)
        if (str != None):
            print(sent + " |" + str + "\n")

if __name__ == "__main__":
    main()
