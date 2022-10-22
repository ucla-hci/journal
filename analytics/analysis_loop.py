# analyze first, store all datapoints into dicts
# then plot altogether to get contact sheet like plot figures

# list of dictionaries e.g. [{filename="",
# name: "",
# length: int,
# content: "",
# duration: "",
# startdate = "",
# dictanalysis={},
# pauses={count, total_paused_time, sentence_before},
# color_dots={count, trigger_word, sentence_in_context}
# highlights={count}
# popup
# sidebar
# dismiss
# reframe = {userresponse ='accept/dismiss', completion_amount=0.5, suggestion=""}
# }, {}]


import pandas as pd
import numpy as np
import json
import re
import os
import sys
import pickle
from pathlib import Path
import matplotlib.pyplot as plt

from datetime import datetime

import logging
import sys

logging.basicConfig(filename="loop_output.log", filemode='w', encoding='utf-8', level=logging.DEBUG, format='%(message)s')
logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))
logging.info('ANALYSIS START')

# globals
PAUSE_DURATION = 3000
L2_DICT_CATEGORY_LIST = ['L2a', 'L2b', 'L2c', 'L2d', 'L2e', 'L2f']
RUN_LOOP_FLAG = True
RUN_PLOTS = False


def get_ngram(alist, n):
    holder = []
    for i in range(len(alist) - (n-1)):
        temp = alist[i]
        for j in range(1, n):
            temp = temp + " " + alist[i + j]
        holder.append(temp)
    return holder


def flagger(row):
    try:
        if row['state'] == "Auto Expressiveness on":
            return 1
        elif row['state'] == "Auto Expressiveness off":
            return -1
        else:
            return 0
    except KeyError as ke:
        logging.error("KeyError working through AutoExpr toggle analysis")
        if ke.args[0] == "state":
            raise NotImplementedError("Old Logging Unable to be analyzed")


def find_highlighted(row):
    # if tag0 not null
    if row['tag0'] == 'L2-highlight':
        fr = row['from0']['ch']
        to = row['to0']['ch']
        return row['text'].splitlines()[row['from0']['line']][fr:to]
    else:
        return


def find_highlighted2(row):
    # if tag0 not null
    if row['tag1'] == 'placeholder':
        fr = row['from1']['ch']
        to = row['to1']['ch']
        return row['text'].splitlines()[row['from1']['line']][fr:to]
    else:
        return


analysis_results = []

# loop over reports folder
dirname = 'reports'
if (not os.path.exists('analysisresults.pickle')) or RUN_LOOP_FLAG:
    for filename in os.listdir(dirname):
        f = os.path.join(dirname, filename)
        if os.path.isfile(f):
            with open(f, encoding="utf-8") as file:
                data = json.loads(file.read())

            logging.info((65*'*' + '\n')*3)
            logging.info(f"Reading file {filename}")
            logging.info(f"Found {len(data.keys())} notes\n")

            for note_number, note_logs in data.items():

                logging.info(f"{65*'-'}")
                # ---------------------------------- Metadata parsing ----------------------------------------
                result_dict = {}
                result_dict['filename'] = filename
                logging.info(f"TITLE:\t\t\t {note_logs['data']['title']}")
                result_dict['title'] = note_logs['data']['title']

                try:
                    tstamp = note_logs['data']['key'][0]['timestamp']
                    logging.info("START TIME:\t\t {}".format(datetime.fromtimestamp((tstamp)/1000.0)))
                    result_dict['start_time'] = datetime.fromtimestamp((tstamp)/1000.0)

                    content = data[note_number]['data']['content'].strip()
                    logging.info(f"# CHARACTERS:\t\t {len(content)}")
                    result_dict['n_characters'] = len(content)
                    logging.info(f"# WORDS:\t\t {len(content.split(' '))} words")
                    result_dict['n_words'] = len(content.split(' '))
                    result_dict['content'] = note_logs['data']['content']

                except IndexError:
                    logging.error("Index error - base parsing. Ignoring demo notes.")
                    continue

                # -------------------------------- Espresso dict analysis ----------------------------------
                words_in_note = re.sub(r'[^\w\s]', '', content).lower().split(' ')

                pkl_file = Path(os.getcwd())
                pkl_file = pkl_file.parents[0] / 'dict' / 'pickled-dict-full.pkl'
                unpickle_dict = pd.read_pickle(pkl_file)
                expanded = unpickle_dict.explode('wordnet_ext').reset_index(drop=True)
                expanded = expanded.explode('phrase_ext').reset_index(drop=True)

                expanded['Word'] = expanded['Word'].str.strip()
                expanded['wordnet_ext'] = expanded['wordnet_ext'].str.strip()
                expanded['phrase_ext'] = expanded['phrase_ext'].str.strip()

                target_words = pd.unique(expanded['Word'].dropna().apply(lambda x: x.strip()))
                target_words = np.append(target_words, pd.unique(expanded['wordnet_ext'].dropna().apply(lambda x: x.strip())))
                target_words = np.append(target_words, pd.unique(expanded['phrase_ext'].dropna().apply(lambda x: x.strip())))

                words_to_analyze = words_in_note + get_ngram(words_in_note, 2)
                words_to_analyze = words_to_analyze + get_ngram(words_in_note, 3)
                filtered_content = [x for x in words_to_analyze if x in target_words]

                cat_dict = {}
                for word in filtered_content:
                    res = expanded[expanded['Word'].str.fullmatch(word, na=False)]
                    cat = ''
                    if len(res) > 0:
                        cat = res['Strategy No.'].values[0]
                    else:
                        res = expanded[expanded['wordnet_ext'].str.fullmatch(word, na=False)]
                        if len(res) > 0:
                            cat = res['Strategy No.'].values[0]
                        else:
                            res = expanded[expanded['phrase_ext'].str.fullmatch(word, na=False)]
                            if len(res) > 0:
                                cat = res['Strategy No.'].values[0]
                            else:
                                pass

                    if cat in cat_dict.keys():
                        cat_dict[cat] += 1
                    else:
                        cat_dict[cat] = 1

                cat_dict = dict(sorted(cat_dict.items()))
                for i in L2_DICT_CATEGORY_LIST:
                    if i not in cat_dict:
                        cat_dict[i] = 0

                logging.info(f"CUSTOM DICT ANALYSIS RESULTS:\t {cat_dict}")
                sorted_dict = {key: value for key, value in sorted(cat_dict.items())}
                result_dict['espresso_analysis'] = sorted_dict
                # ----------------------------- End espresso analysis --------------------------------------

                # plt.bar(range(len(cat_dict)), list(cat_dict.values()), align='center')
                #
                # plt.title('plot title')
                # plt.xlabel('Word Frequency')
                # plt.ylabel('Dictionary Categories')

                # plt.savefig('reports/plots/'+filename+note_number+'_dict_analysis.png', bbox_inches='tight', dpi=300)
                # plt.clf()

                # writing behavior ##########################################################################################
                try:
                    # new analysis
                    if 'accept' in note_logs['data'].keys():
                        df = pd.DataFrame(note_logs['data']['key'])
                        df = df.drop([0])

                        df['timestamp_diff'] = df['timestamp'].diff()
                        df['session_id'] = df.apply(lambda row: 1 if row['timestamp_diff'] < 0 else 0, axis=1).cumsum()
                        df['pauses'] = df.apply(lambda row: 1 if row['timestamp_diff'] > PAUSE_DURATION else 0, axis=1)

                        pause_list = df.index[df['pauses'] == 1].tolist()
                        a = df.groupby('session_id')['timestamp'].max()
                        result_dict['duration'] = (a.sum()/1000)/60
                        logging.info(f"WRITING DURATION:\t {(a.sum()/1000)/60:.2f} minutes")

                        result_dict['pauses'] = {}
                        #
                        result_dict['pauses']['plot'] = False        # use this to signal if should be plot or not
                        # get count:
                        result_dict['pauses']['count'] = len(pause_list)
                        # get timestamps + text for context:
                        result_dict['pauses']['pauselist_idx'] = pause_list
                        result_dict['pauses']['pauselist'] = df.loc[pause_list][['timestamp', 'text', 'marks', 'placeholder', 'session_id']].to_dict('records')
                        # total time paused - sum timestamp_diff
                        result_dict['pauses']['totalpausetime'] = df.loc[pause_list]['timestamp_diff'].sum()/1000
                        # pause frequency! number of events/period of time. could be windowed.
                        result_dict['pauses']['frequency'] = len(pause_list) / result_dict['duration']

                        logging.info(f"#pauses: \t\t {result_dict['pauses']['count']}")
                        logging.info(f"total pause time: \t {result_dict['pauses']['totalpausetime']:.2f} seconds")
                        logging.info(f"pause frequency: \t {result_dict['pauses']['frequency']:.2f}")

                        # df["timestamp"].div(1000).round(2).plot()
                        result_dict['pauses']['plot_data'] = df["timestamp"].div(1000).round(2)
                        result_dict['pauses']['plot'] = True
                        # [plt.axvline(_x, linewidth=0.2, color='r') for _x in pause_list]
                        # plt.title('plot title')
                        # plt.xlabel('Keystroke Events')
                        # plt.ylabel('Time (s)')

                        # plt.savefig('reports/plots/'+filename+note_number+'_pauses.png', bbox_inches='tight', dpi=300)
                        # plt.clf()

                        # --------------------------------------------------------
                        df_key = pd.DataFrame(data[note_number]['data']['key'])
                        df_toggle = pd.DataFrame(data[note_number]['data']['toggle'])
                        df_sidebar = pd.DataFrame(data[note_number]['data']['sidebar'])
                        df_popup = pd.DataFrame(data[note_number]['data']['popup'])
                        df_dismiss = pd.DataFrame(data[note_number]['data']['dismiss'])
                        df_accept = pd.DataFrame(data[note_number]['data']['accept'])

                        # --------------------------------------------------------

                        df_dismiss = df_dismiss[df_dismiss['type'] != 'start']
                        df_dismiss = df_dismiss.assign(type='dismiss')
                        df_accept = df_accept[df_accept['type'] != 'start']
                        df_accept = df_accept.assign(type='accept')
                        # --------------------------------------------------------

                        filteredL2 = df_toggle[df_toggle['type'] == 'toggleL2']
                        concat1 = pd.concat([df_key, filteredL2]).sort_values(by="timestamp")
                        concat1 = concat1[concat1['type'] != 'start'].reset_index()
                        # concat1['timestamp'] = concat1['timestamp'] - min(concat1['timestamp'])

                        if 'report_P5' in filename and note_number == '2':
                            logging.info("trimming end of report_P5 - note #2")
                            concat1.drop(concat1.tail(3).index, inplace=True)

                        # L2 on and off
                        L2_toggleOn_list = concat1.index[(concat1['type'] == 'toggleL2') & (concat1['activated'] == True)].tolist()
                        L2_toggleOff_list = concat1.index[(concat1['type'] == 'toggleL2') & (concat1['activated'] == False)].tolist()

                        logging.info(f"Toggle Analysis On times: {len(L2_toggleOn_list)}")
                        logging.info(f"Toggle Analysis Off times: {len(L2_toggleOff_list)}")

                        result_dict['L2_toggleOn_list'] = L2_toggleOn_list
                        result_dict['L2_toggleOff_list'] = L2_toggleOff_list
                        # --------------------------------------------------------
                        try:
                            df_toggle['autoexpr'] = df_toggle.apply(flagger, axis=1).cumsum()
                            manualassist_expr_count = len(df_toggle[(df_toggle['autoexpr'] == 0) & (df_toggle['state'] == 'Assist Expressiveness')])
                            logging.info(f"Manual Assist expr count: {manualassist_expr_count}")
                        except NotImplementedError as nie:
                            logging.error("Old logging version, unable to extract autoexpr data")
                            logging.info(f"Showing raw toggle dataframe: {df_toggle}")
                        # --------------------------------------------------------
                        filteredL1 = df_toggle[df_toggle['type'] == 'toggleL1']
                        concat2 = pd.concat([df_key, filteredL1]).sort_values(by="timestamp")
                        concat2 = concat2[concat2['type'] != 'start'].reset_index()

                        if 'report_P5' in filename and note_number == '2':
                            logging.info("trimming end of report_P5 - note #2")
                            concat2.drop(concat2.tail(3).index, inplace=True)

                        L1_toggleOn_list = concat2.index[concat2['state'] == "Auto Expressiveness on"].tolist()
                        L1_toggleOff_list = concat2.index[concat2['state'] == "Auto Expressiveness off"].tolist()
                        L1_events_list = concat2.index[concat2['auto'] == False].tolist()
                        logging.info(f"AutoAssist Expressiveness On: {len(L1_toggleOn_list)}\nAutoAssist Expressiveness Off: {len(L1_toggleOff_list)}\n")

                        result_dict['concat2'] = concat2
                        result_dict['L1_toggleOn_list'] = L1_toggleOn_list
                        result_dict['L1_toggleOff_list'] = L1_toggleOff_list
                        result_dict['L1_events_list'] = L1_events_list
                        # --------------------------------------------------------
                        # highlights:
                        df_highlight_data = df_key[df_key["marks"].str.len() != 0]
                        idx = pd.DataFrame(df_highlight_data.marks.reset_index().values.tolist()[1:])[0].apply(pd.Series)
                        try:
                            col0 = pd.DataFrame(df_highlight_data.marks.values.tolist()[1:])[0].apply(pd.Series).rename(columns={"tag": "tag0", "from": "from0", "to": "to0"})
                            col1 = pd.DataFrame(df_highlight_data.marks.values.tolist()[1:])[1].apply(pd.Series).rename(columns={"tag": "tag1", "from": "from1", "to": "to1"})
                            checker = [col0['tag0'][0], col1['tag1'][0]]
                        except KeyError as ke:
                            logging.error("KeyErr getting highlihgts: col0, col1")
                            if ke.args[0] == 0:
                                checker = []
                            elif ke.args[0] == 1:
                                checker = [col0['tag0'][0]]
                        if len(checker) == 2:
                            exploded = pd.concat([idx, col0, col1], axis=1)
                            exploded = exploded.set_index(0)

                            # UNABLE TO CAPTURE IF col0 or col1

                            df_highlights = pd.concat([df_highlight_data, exploded], axis=1)
                            df_highlights = df_highlights[df_highlights['tag0'] == 'L2-highlight'].drop(columns=['marks', 'dismisses', 'accepts', 'l2dismisses', 'placeholder'])
                            df_highlights['highlighted'] = df_highlights.apply(find_highlighted, axis=1)
                            try:
                                hl_words = df_highlights.loc[df_highlights['highlighted'].shift(-1) != df_highlights['highlighted']]['highlighted'].to_list()
                                logging.info(f"Number of highlights: {len(hl_words)} - words: {hl_words}")
                                result_dict['df_highlights'] = df_highlights
                            except KeyError as ke:
                                print(f"Highlights1 key error {ke} ".ljust(100, '-'))
                                if ke.args[0] == 'highlighted':
                                    logging.error("error getting highlighted contents. Is it empty?")
                                    logging.error(df_highlights)
                                else:
                                    logging.error(f"Key causing error: {ke.args[0]}")
                                print("end error ".ljust(100, '-'))
                                # continue

                            # placeholders:
                            df_highlights = pd.concat([df_highlight_data, exploded], axis=1)
                            df_highlights = df_highlights[df_highlights['tag1'] == 'placeholder']
                            df_highlights['highlighted'] = df_highlights.apply(find_highlighted2, axis=1)
                            try:
                                ph_words = df_highlights.loc[df_highlights['highlighted'].shift(-1) != df_highlights['highlighted']]['highlighted'].to_list()
                                logging.info(f"Number of placeholder: {len(ph_words)} - words: {ph_words}")
                                result_dict['df_placeholder'] = df_highlights
                            except KeyError as ke:
                                print(f"Highlights2 key error {ke} ".ljust(100, '-'))
                                if ke.args[0] == 'highlighted':
                                    logging.error("error getting highlighted contents. Is it empty?")
                                    logging.error(df_highlights)
                                else:
                                    logging.error(f"Key causing error: {ke.args[0]}")
                                print("end error ".ljust(100, '-'))
                                # continue

                        elif len(checker) == 1:
                            exploded = pd.concat([idx, col0], axis=1)
                            exploded = exploded.set_index(0)

                            if 'L2-highlight' in checker:  # fine

                                df_highlights = pd.concat([df_highlight_data, exploded], axis=1)
                                df_highlights = df_highlights[df_highlights['tag0'] == 'L2-highlight'].drop(columns=['marks', 'dismisses', 'accepts', 'l2dismisses', 'placeholder'])
                                df_highlights['highlighted'] = df_highlights.apply(find_highlighted, axis=1)
                                try:
                                    hl_words = df_highlights.loc[df_highlights['highlighted'].shift(-1) != df_highlights['highlighted']]['highlighted'].to_list()
                                    logging.info(f"Number of highlights: {len(hl_words)} - words: {hl_words}")
                                except KeyError as ke:
                                    print(f"Highlights1 key error {ke} ".ljust(100, '-'))
                                    if ke.args[0] == 'highlighted':
                                        logging.error("error getting highlighted contents. Is it empty?")
                                        logging.error(df_highlights)
                                    else:
                                        logging.error(f"Key causing error: {ke.args[0]}")
                                    print("end error ".ljust(100, '-'))
                                    # continue

                            else:
                                # placeholders: rename cols to tag1, from1, to1
                                df_highlights = pd.concat([df_highlight_data, exploded], axis=1).rename(columns={'tag0': 'tag1', 'from0': 'from1', 'to0': 'to1'})
                                df_highlights = df_highlights[df_highlights['tag1'] == 'placeholder']
                                df_highlights['highlighted'] = df_highlights.apply(find_highlighted2, axis=1)
                                try:
                                    ph_words = df_highlights.loc[df_highlights['highlighted'].shift(-1) != df_highlights['highlighted']]['highlighted'].to_list()
                                    logging.info(f"Number of placeholder: {len(ph_words)} - words: {ph_words}")
                                except KeyError as ke:
                                    print(f"Highlights2 key error {ke} ".ljust(100, '-'))
                                    if ke.args[0] == 'highlighted':
                                        logging.error("error getting highlighted contents. Is it empty?")
                                        logging.error(df_highlights)
                                    else:
                                        logging.error(f"Key causing error: {ke.args[0]}")
                                    print("end error ".ljust(100, '-'))
                                    # continue
                        # --------------------------------------------------------
                        concat1b = pd.concat([concat1, df_sidebar, df_popup]).sort_values(by='timestamp')
                        concat1b = concat1b[concat1b['type'] != 'start'].reset_index()

                        popup_evts = concat1b.index[concat1b['type'] == "popup"].tolist()
                        sidebar_evts = concat1b.index[concat1b['type'] == "sidebar"].tolist()
                        logging.info(f"Popup count: {len(popup_evts)}\nSidebar count: {len(sidebar_evts)}\n")

                        result_dict['concat1b'] = concat1b
                        result_dict['popup_evts'] = popup_evts
                        result_dict['sidebar_evts'] = sidebar_evts
                        # -------------------------------------------------------- DISMISSLIST
                        df_dismisslist = pd.DataFrame(data[note_number]['data']['dismisslist'])
                        try:
                            words_dismissed = df_dismisslist['word'].to_list()
                            logging.info(f"Dismissed {len(words_dismissed)} ANALYSIS words\n{words_dismissed}")
                        except KeyError as ke:
                            print(f"Dismisslist key error {ke} ".ljust(100, '-'))
                            if ke.args[0] == 'word':
                                logging.error("error getting dismisslist contents. Is it empty?")
                                logging.error(df_dismisslist)
                            else:
                                logging.error(f"Key causing error: {ke.args[0]}")
                            print("end error ".ljust(100, '-'))
                            # continue
                        # --------------------------------------------------------
                        logging.info(f"NUMBER OF PLACEHOLDER dimsisses: {pd.DataFrame(df_key['dismisses'].iloc[-1]).shape[0] - 1}")

                    else:  # just use keys -- e.g. note:
                        logging.info("Old analysis")

                except ValueError as ve:
                    print(f"start value error {ve} ".ljust(100, '-'))
                    # print(df.describe(include='all'))
                    if df.shape[0] == 0:
                        print("df has 0 rows. is dataframe empty?")
                    print("end error ".ljust(100, '-'))
                    continue
                except KeyError as ke:
                    print(f"start key error {ke} ".ljust(100, '-'))
                    # print(df.describe(include='all'))
                    print(f"wrong key: {ke.args[0]}")

                    # if ke.args[0] == 'activated':
                    #    handle case
                    if ke.args[0] == 'word':
                        logging.error("error getting dismisslist contents. Is it empty?")
                        logging.error(df_dismisslist)

                    print("end error ".ljust(100, '-'))
                    continue
                except Exception as e:
                    # print(f"caught {e=}, {type(e)=}")
                    logging.critical(e, exc_info=True)

                else:
                    analysis_results.append(result_dict)

        else:
            continue

    with open('analysisresults.pickle', 'wb') as handle:
        pickle.dump(analysis_results, handle, protocol=pickle.HIGHEST_PROTOCOL)

else:
    print("SKIPPING ANALYSIS")
    with open('analysisresults.pickle', 'rb') as handle:
        analysis_results = pickle.load(handle)


if not RUN_PLOTS:
    sys.exit(1)


print("RESULTS ---------------------------------")
print("Pause plots")
plot_results = [x for x in analysis_results if 'pauses' in x]
print(f"{len(plot_results)} notes have pause data")

n_results = len(plot_results)

fig = plt.figure(figsize=(20, 20))
plt.subplots_adjust(hspace=0.5)

max_col = 5
max_plots = 10
row = 0


for idx, user in enumerate(plot_results):
    if idx >= max_plots:
        break
    if idx % max_col == 0:
        row += 1
    # print(user['espresso_analysis'])
    # print(f"{max_plots, row, (idx % max_col)+1}")
    ax = plt.subplot2grid((max_plots//max_col, 4), (row-1, (idx % max_col)))
    ax.bar(range(len(user['espresso_analysis'])), list(user['espresso_analysis'].values()), align='center')
    ax.set_xticks(range(len(user['espresso_analysis'])), list(user['espresso_analysis'].keys()))
    ax.title.set_text(f"{user['filename']} - {user['start_time']}")
    ax.set_ylim([0, 20])
    plt.grid(which='both', axis='y', linewidth=0.2)

fig.text(0.5, 0.04, 'Dictionary Categories', ha='center', va='center')
fig.text(0.06, 0.5, 'Count', ha='center', va='center')
fig.suptitle('Category count in each note')
