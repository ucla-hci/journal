# React-Expresso

migration from vanilla js version to use webpack, React/ES6, and codemirror6.

## Project Structure

## Tests

## Development Diary

(11/01/2022)
- analysis flow is almost ready, missing rewrite and dismiss (in popup)
- used dexie db to hold state of popup's display:"none" style
  - Needed to handle state with app outside of react
  - alternative? - use cm editor inline extension with setState from parent, passed via props 
- For now, just developing base atomic insertions into editor

(10/18/22)
- DemoTooltip.tsx shows how to insert div above
  - currently hardcoded to work with the word "test"



(10/12/22)
- worked through basic Dexie.js example
- use 209 project as reference for note management
- but briefly:
  - editor starts empty
  - Note management:
    - onload, we fetch from db to populate sidebar with notes
      - props can be surfaced to parent so parent also knows of notelist 
    - notelist onclick () => select note and launch editor 
  - Note saving
    - use timeout 3s for saving

Recommendation: start with managing entries with title+date to begin. then add editor stuff + logging


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
