import {
  EditorSelection,
  EditorState,
  SelectionRange,
} from "@codemirror/state";
import { SearchQuery, SearchCursor } from "@codemirror/search";
import { dev_dict as dict_temp } from "../expressoDictionary";
import { Sidebar } from "../Dexie/db";

export interface ExtendedSearchResult {
  range: SelectionRange;
  color: string;
  triggerword: string;
  wordlocations?: { from: number; to: number }[];
  popupcontent: { title: string; content: string; showsidebar: boolean };
  sidebarcontent: Sidebar;
  placeholdercontent: {
    suggestion: string | null;
    location: number;
    replace: { from: number; to: number } | null;
  };
}

export class Searcher {
  state: EditorState;

  constructor({ state }: { state: EditorState }) {
    this.state = state;
  }

  getPHlocation(position: string, oglocation: number): number {
    let sentence_end_rgx = "[.?!]+[ ]+";
    let end_punctuation_rgx = "[.?!]+";
    var q1 = new SearchQuery({ search: sentence_end_rgx, regexp: true });
    var q2 = new SearchQuery({ search: end_punctuation_rgx, regexp: true });
    var cursor1 = q1.getCursor(this.state.doc).next() as SearchCursor;
    var cursor2 = q2.getCursor(this.state.doc).next() as SearchCursor;

    let search1 = [];
    let search2 = [];
    while (!cursor1.done) {
      search1.push(cursor1.value);
      cursor1.next();
    }
    while (!cursor2.done) {
      search2.push(cursor2.value);
      cursor2.next();
    }

    switch (position.toLowerCase()) {
      case "end":
        // get last few chars in doc
        let lastchar = this.state.doc.toString().slice(-1);
        if (lastchar === " ") {
          return this.state.doc.toString().length;
        } else {
          // TODO: prompt extension to add space --------------------------------------
          return this.state.doc.toString().length;
        }

      case "after":
        let after_idx1 = search1
          .filter((val) => val.to > oglocation)
          .map((val) => val.to);
        let after_idx2 = search2
          .filter((val) => val.to > oglocation)
          .map((val) => val.to);

        if (after_idx1.length > 0) {
          return after_idx1[0];
        } else if (after_idx2.length > 0) {
          return after_idx2[0];
        } else {
          // console.log("no space");
          return this.state.doc.toString().length;
        }
      case "before":
        let before_idx1 = search1
          .filter((val) => val.to < oglocation)
          .map((val) => val.to)
          .reverse();
        let before_idx2 = search2
          .filter((val) => val.to < oglocation)
          .map((val) => val.to)
          .reverse();
        if (before_idx1.length > 0) {
          return before_idx1[0];
        } else if (before_idx2.length > 0) {
          return before_idx2[0];
        } else {
          return 0;
        }
      default:
        break;
    }

    return 0;
  }

  searchDict(): ExtendedSearchResult[] {
    var searchresults = [] as ExtendedSearchResult[];

    dict_temp.forEach((element) => {
      let concat_word_options = element.words.concat(
        element.phrase_ext,
        element.wordnet_ext
      );
      // console.log("concat_word_options", concat_word_options);

      concat_word_options.forEach((single) => {
        var regexsearch = "\\b" + single + "\\b";
        var q = new SearchQuery({ search: regexsearch, regexp: true }); // might need to optimize here
        var cursor = q.getCursor(this.state.doc) as SearchCursor;

        while (!cursor.done) {
          // get phlocation here!
          let phlocation = cursor.value.to;
          let rewrite_contents = null as null | string;
          let replace = null as { from: number; to: number } | null;

          if (element.rewrite !== null) {
            if (element.rewrite_position.toLowerCase() === "replace") {
              // find word to replace
              replace = { from: cursor.value.from, to: cursor.value.to };
              phlocation = cursor.value.to;
            } else {
              phlocation = this.getPHlocation(
                element.rewrite_position,
                cursor.value.to
              );
            }
            rewrite_contents =
              element.rewrite[
                Math.floor(Math.random() * element.rewrite.length)
              ]; // curently pick at random. But can be tuned!
          }

          if (cursor.value.from < cursor.value.to) {
            let rgbcol = hexToRgb(element.color);
            let rgbcolstr =
              "rgba(" +
              rgbcol?.r +
              "," +
              rgbcol?.g +
              "," +
              rgbcol?.b +
              ", 0.5)";

            searchresults.push({
              range: EditorSelection.range(cursor.value.from, cursor.value.to),
              // color: element.color,
              color: rgbcolstr,
              triggerword: this.state.sliceDoc(
                cursor.value.from,
                cursor.value.to
              ),
              popupcontent: {
                title: element.popup_title!,
                content: element.popup_feedback!,
                showsidebar: element.Sidebar_feedback !== null,
              },
              sidebarcontent: {
                title: "sidebar title",
                display: false,
                content: element.Sidebar_feedback!,
                rephrase: element.rewrite !== null,
              },
              placeholdercontent: {
                suggestion: rewrite_contents,
                location: phlocation,
                replace: replace !== null ? replace : null,
              },
            });
          }
          cursor.next();
        }
      });
    });

    return searchresults;
  }
}

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
