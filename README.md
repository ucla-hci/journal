# React-Expresso

migration from vanilla js version to use webpack, React/ES6, and codemirror6.

## Project Structure

## Tests

## Development Diary

(10/08/22)
- got basic search working in updatelisteners.tsx
- ![get dom coords at cursor position](https://codemirror.net/docs/ref/#view.EditorView.coordsAtPos)
- todo: try out extension of marker
- future: use dexie.js as a wrapper for indexedDB
  - need to think about defining DB model 
  - consider the feature of weekly reports


<br>

---

(10/07/22)
rework
- scrapped previous editor (useCodeMirror.tsx)
- replaced with Editor.tsx. made using ![new source](https://www.bayanbennett.com/posts/failing-to-add-codemirror-6-and-then-succeeding-devlog-004/)

new
- added highlight listener+decorator using ![this link](https://codemirror.net/examples/decoration/)

next
- save with indexedDB
- find how to toggle extensions programmatically rather than shortcut

potentially useful links:
- this for messages? ![check it](https://codemirror.net/examples/panel/)
- codemirror-languageserver extension
  - looks like ppl just install, not make

<br>

---

(10/04/22) 
- Initialized codemirror component using ![this source](https://www.codiga.io/blog/implement-codemirror-6-in-react/)
- Started basic custom styling in useCodeMirror.tsx
- Added sidebar components

Notes for future:
- Checkpoint 1:  https://discuss.codemirror.net/t/codemirror-6-proper-way-to-listen-for-changes/2395/5 
  - keep track of codemirror editor state
  - same file when restart/reload browser (saved to indexedDB)
- Checkpoint 2:
  - Get marker dots,
  - highlights
  - popups
- Alt Checkpoint 2:
  - style files -- get color palette
  - get proper display/alignment
  - get children outlines ready (buttons, content, etc)


palettes?
- https://lospec.com/palette-list/oil-6
- https://lospec.com/palette-list/gooseberry-thistle
- https://lospec.com/palette-list/neon-night-sky <--------------
- https://lospec.com/palette-list/coral-reef

Font: roboto?
