import { Extension, Compartment } from "@codemirror/state";
import { keymap, EditorView } from "@codemirror/view";
import { cursorTooltipField } from "./CookMarks";

export function toggleWith(
  key: string,
  extension: Extension,
  marksActive: boolean,
  setMarksActive: React.Dispatch<React.SetStateAction<boolean>>
) {
  let myCompartment = new Compartment();
  function toggle(view: EditorView) {
    console.log("running tooltip toggle");

    let on = myCompartment.get(view.state) === extension;
    setMarksActive(!on);
    view.dispatch({
      effects: myCompartment.reconfigure(on ? [] : extension),
    });
    return true;
  }
  return [myCompartment.of([]), keymap.of([{ key, run: toggle }])];
}
