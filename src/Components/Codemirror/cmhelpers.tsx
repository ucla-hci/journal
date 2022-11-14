import {
  EditorSelection,
  EditorState,
  SelectionRange,
} from "@codemirror/state";
import { SearchQuery, SearchCursor } from "@codemirror/search";
import { dict_temp, L1_dict } from "../expressoDictionary";
import { Sidebar } from "../Dexie/db";

export interface ExtendedSearchResult {
  range: SelectionRange;
  color: string;
  popupcontent: { title: string; content: string };
  sidebarcontent: Sidebar;
  placeholdercontent: { suggestion: string | null; location: number };
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
        if (search1.length > 0) {
          // console.log("punct+space");
          let idx1 = search1
            .filter((val) => val.to > oglocation)
            .map((val) => val.to);

          return idx1[0];
        } else if (search2.length > 0) {
          // console.log("punct w/o space");
          let idx2 = search2
            .filter((val) => val.to > oglocation)
            .map((val) => val.to);
          return idx2[0];
        } else {
          // console.log("no space");
          return this.state.doc.toString().length;
        }
      case "before":
        if (search1.length > 0) {
          // console.log("punct+space");
          let idx1 = search1
            .filter((val) => val.to < oglocation)
            .map((val) => val.to);

          return idx1.reverse()[0];
        } else if (search2.length > 0) {
          // console.log("punct w/o space");
          let idx2 = search2
            .filter((val) => val.to < oglocation)
            .map((val) => val.to);
          return idx2.reverse()[0];
        } else {
          // console.log("no space");
          return this.state.doc.toString().length;
        }
      default:
        break;
    }

    return 0;
  }

  searchDict(): ExtendedSearchResult[] {
    var searchresults = [] as ExtendedSearchResult[];

    dict_temp.forEach((element) => {
      var regexsearch = "\\b" + element.Word! + "\\b";
      var q = new SearchQuery({ search: regexsearch, regexp: true }); // might need to optimize here
      var cursor = q.getCursor(this.state.doc) as SearchCursor;

      while (!cursor.done) {
        // get phlocation here!
        let phlocation = cursor.value.to;
        let rewrite_contents = null as null | string;

        if (element.rewrite !== null) {
          phlocation = this.getPHlocation(
            element.rewrite_position,
            cursor.value.to
          );
          rewrite_contents =
            element.rewrite[Math.floor(Math.random() * element.rewrite.length)]; // curently pick at random. But can be tuned!
          console.log("rewrite_contents", rewrite_contents);
        }

        if (cursor.value.from < cursor.value.to) {
          searchresults.push({
            range: EditorSelection.range(cursor.value.from, cursor.value.to),
            color: element.color,
            popupcontent: {
              title: element.popup_title!,
              content: element.popup_feedback!,
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
            },
          });
        }
        cursor.next();
      }
    });

    return searchresults;
  }
}
