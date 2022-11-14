import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { db } from "../../Dexie/db";
import { suggestionfacet } from "./facets";

export var editvalue = "";

export const placeholders = ViewPlugin.fromClass(
  class {
    placeholders: DecorationSet;
    suggestionfull: string;
    suggestion: string;
    from: number;
    to: number;
    ph_cursor: number;
    typo_counter: number;
    constructor(view: EditorView) {
      // on plugin load
      this.suggestionfull = view.state.facet(suggestionfacet).target!;
      this.suggestion = view.state.facet(suggestionfacet).target!;
      this.from = view.state.facet(suggestionfacet).from!;
      this.to = view.state.facet(suggestionfacet).to!;

      this.ph_cursor = 0;
      this.typo_counter = 0;

      let e = new RangeSetBuilder<Decoration>();
      e.add(
        this.from,
        this.from,
        Decoration.replace({ widget: new PlaceholderWidget(this.suggestion) })
      );
      this.placeholders = e.finish();
    }
    update(update: ViewUpdate) {
      let e = new RangeSetBuilder<Decoration>();

      update.transactions.forEach((tr) => {
        // ---------------------------------------------------------- Case where user moves away from selection
        if (tr.isUserEvent("select")) {
          let ranges = tr.state.selection.ranges;
          if (ranges.length > 0) {
            if (ranges[0].from !== this.from) {
              db.placeholders.update(1, { active: false });
            }
          }
        }

        // ---------------------------------------------------------- Case where user makes an input with keyboard
        if (tr.isUserEvent("input.type")) {
          let useraction = tr.changes.toJSON();

          let delta: any;
          if (useraction.length === 1) {
            delta = useraction[0];
          } else {
            delta = useraction[1];
          }
          if (delta.length === 2) {
            if (delta[1] === this.suggestion[0] && this.typo_counter === 0) {
              console.log("good", delta[1]);
              this.ph_cursor++;
              this.suggestion = this.suggestion.slice(1);
              this.from = this.from + 1;

              e.add(
                this.from,
                this.from,
                Decoration.replace({
                  widget: new PlaceholderWidget(this.suggestion),
                })
              );
              this.placeholders = e.finish();
            } else {
              console.log("mismatch", delta[1], this.suggestion[0]);
              this.typo_counter++;
              this.placeholders = e.finish();
            }
          } else if (delta.length === 1) {
            console.log("deleted");

            if (this.typo_counter > 0) {
              this.typo_counter--;
              if (this.typo_counter === 0) {
                console.log("cleared typo buffer");
                e.add(
                  this.from,
                  this.from,
                  Decoration.replace({
                    widget: new PlaceholderWidget(this.suggestion),
                  })
                );
                this.placeholders = e.finish();
              }
            } else if (this.ph_cursor > 0) {
              this.ph_cursor--;
              this.from--;
              this.suggestion = this.suggestionfull.slice(this.ph_cursor);
              e.add(
                this.from,
                this.from,
                Decoration.replace({
                  widget: new PlaceholderWidget(this.suggestion),
                })
              );
              this.placeholders = e.finish();
            }
            if (this.ph_cursor === 0) {
              // if delete last letter -hide!
              db.placeholders.update(1, { active: false });
            }
          }
        } else if (tr.isUserEvent("delete")) {
          console.log("ph char deletion");

          db.placeholders.update(1, { active: false });
        }
      });
      if (
        this.ph_cursor === this.suggestionfull.length ||
        this.typo_counter >= 2
      ) {
        console.log("deactviating placeholder");
        db.placeholders.update(1, { active: false });
      }
    }
  },
  {
    decorations: (instance) => instance.placeholders,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.placeholders || Decoration.none;
      }),
  }
);

class PlaceholderWidget extends WidgetType {
  public inner: string;
  constructor(input: string) {
    super();
    this.inner = input;
  }
  toDOM(view: EditorView): HTMLElement {
    let element = document.createElement("span");
    element.innerText = this.inner.toString();
    element.className = "cm-atomic";
    return element;
  }
}
