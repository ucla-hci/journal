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
import { metadatafacet, notemetadata, suggestionfacet } from "./facets";

export const placeholders = ViewPlugin.fromClass(
  class {
    placeholders: DecorationSet;
    suggestionfull: string;
    suggestion: string;
    from: number;
    to: number;
    ph_cursor: number;
    typo_counter: number;
    replace: { from: number; to: number } | null;
    inittimestamp: number;
    starttime: number;
    metadata: notemetadata;
    origin: "L1" | "L3";
    constructor(view: EditorView) {
      this.metadata = view.state.facet(metadatafacet)!;

      // on plugin load
      this.suggestionfull = view.state.facet(suggestionfacet).target!;
      this.suggestion = view.state.facet(suggestionfacet).target!;
      this.from = view.state.facet(suggestionfacet).from!;
      this.to = view.state.facet(suggestionfacet).to!;
      this.replace = view.state.facet(suggestionfacet).replace!;

      this.ph_cursor = 0;
      this.typo_counter = 0;

      this.starttime = Date.now();
      this.inittimestamp = this.metadata.timeduration;
      this.origin = view.state.facet(suggestionfacet).origin!;

      db.logs.add({
        assocnote: this.metadata.noteid,
        timestamp: this.metadata.timeduration,
        feature: this.origin === "L1" ? "L1singleexpressiveness" : "L3rephrase",
        featurestate: "enable",
        comments:
          this.replace !== null
            ? "replacing: " +
              view.state.sliceDoc(this.replace?.from!, this.replace?.to!)
            : null,
      });

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
        console.log("deactviating placeholder"); // <---------------- this becomes "onLose"
        let timestamp = Date.now() - this.starttime + this.inittimestamp;

        db.logs.add({
          assocnote: this.metadata.noteid,
          timestamp: timestamp,
          feature:
            this.origin! === "L1" ? "L1singleexpressiveness" : "L3rephrase",
          featurestate: "dismiss",
          comments: `completion: ${this.suggestionfull.slice(
            0,
            this.ph_cursor
          )}/${this.suggestionfull}`,
        });

        db.placeholders.update(1, { active: false });
      }
    }
  },
  {
    decorations: (instance) => instance.placeholders,
    provide: (plugin) => [
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.placeholders || Decoration.none;
      }),
      EditorView.decorations.of((view) => {
        let replace = view.plugin(plugin)?.replace;
        if (replace !== null) {
          return Decoration.set(
            Decoration.mark({ class: "cm-replace" }).range(
              replace?.from!,
              replace?.to!
            )
          );
        } else {
          return Decoration.none;
        }
      }),

      EditorView.inputHandler.of((view, from, to, text) => {
        // <----- <----- this becomes <----- "on win"
        let replace = view.plugin(plugin)?.replace;
        let trigger =
          view.plugin(plugin)?.ph_cursor ===
          view.plugin(plugin)?.suggestionfull.length! - 1; // do last char check here too

        if (replace !== null && trigger) {
          let timestamp =
            Date.now() -
            view.plugin(plugin)?.starttime! +
            view.plugin(plugin)?.inittimestamp!;

          db.logs.add({
            assocnote: view.plugin(plugin)?.metadata.noteid!,
            timestamp: timestamp,
            feature:
              view.plugin(plugin)?.origin! === "L1"
                ? "L1singleexpressiveness"
                : "L3rephrase",
            featurestate: "complete",
            comments: `completion: ${
              view
                .plugin(plugin)
                ?.suggestionfull.slice(0, view.plugin(plugin)?.ph_cursor) + text
            }/${view.plugin(plugin)?.suggestionfull}`,
          });

          let changes = [
            { from: from, insert: text },
            { from: replace?.from!, to: replace?.to! },
          ];

          view.dispatch({
            changes,
            selection: {
              anchor:
                replace?.from! + view.plugin(plugin)?.suggestionfull?.length!,
            },
            sequential: true,
          });
          db.placeholders.update(1, { active: false });

          return true;
        }
        return false;
      }),
    ],
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
