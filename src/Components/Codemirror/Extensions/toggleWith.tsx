import { Extension, Compartment } from "@codemirror/state";
import { keymap, EditorView } from "@codemirror/view";

export function toggleWith(
  key: string,
  extension: Extension,
  setMarksActive: React.Dispatch<React.SetStateAction<boolean>>
) {
  let myCompartment = new Compartment();
  function toggle(view: EditorView) {
    let on = myCompartment.get(view.state) === extension;
    setMarksActive(!on);
    view.dispatch({
      effects: myCompartment.reconfigure(on ? [] : extension),
    });
    return true;
  }
  return [myCompartment.of([]), keymap.of([{ key, run: toggle }])];
}
