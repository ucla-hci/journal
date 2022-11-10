import {
  EditorSelection,
  EditorState,
  SelectionRange,
} from "@codemirror/state";
import { SearchQuery, SearchCursor } from "@codemirror/search";
import { dict_temp } from "../expressoDictionary";

export interface ExtendedSearchResult {
  range: SelectionRange;
  color: string;
  popupcontent: { title: string; content: string };
  sidebarcontent: { title: string; content: {} };
}

export class Searcher {
  state: EditorState;

  constructor({ state }: { state: EditorState }) {
    this.state = state;
  }

  searchDict(): ExtendedSearchResult[] {
    var searchresults = [] as ExtendedSearchResult[];

    dict_temp.forEach((element) => {
      var regexsearch = "\\b" + element.Word! + "\\b";
      var q = new SearchQuery({ search: regexsearch, regexp: true });
      var cursor = q.getCursor(this.state.doc) as SearchCursor;

      while (!cursor.done) {
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
              content: element.Sidebar_feedback!,
            },
          });
        }
        cursor.next();
      }
    });

    return searchresults;
  }
}
