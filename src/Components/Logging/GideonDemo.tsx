import React from "react";

import { Gideon } from "@tmdt-buw/gideon-replay";

// Just for debugging the faulty replay -----------------------
document.addEventListener("keydown", (event) => {
  if (event.isComposing || event.keyCode === 229) {
    return;
  }
  console.log("received keypress: ", event);
});

document.addEventListener("mousedown", (event) => {
  console.log("received mousedown: ", event);
});
document.addEventListener("mouseup", (event) => {
  console.log("received mouseup: ", event);
});
document.addEventListener("click", (event) => {
  console.log("received click: ", event);
});
// -----------------------------------------------------------

export default function GideonDemo() {
  function start_gideon() {
    console.log("something else");
    // var x = document.querySelector(".aform");
    var x = document.querySelector(".App");
    Gideon.getInstance().registerElement(x);
  }

  function replay_gideon() {
    var hist = Gideon.getInstance().getHistoryRecords();
    console.log("hist: ", hist);
    var myForm = document.getElementById("theone") as HTMLFormElement;
    Gideon.getInstance().replay(
      // document.querySelector(".cm-root"),
      // document.querySelector(".aform"),
      document.querySelector(".App"),
      hist[0],
      () => myForm.reset()
    );
  }

  return (
    <div style={{ border: "5px solid blue" }}>
      <h3>GIDEON DEMO</h3>
      <form className="aform" id="theone">
        <label>
          Name:
          <input type="text" name="name" />
        </label>
        <input type="submit" value="Submit" />
      </form>
      <button onClick={start_gideon}>start_gideon</button>
      {/* <button onClick={log_gideon}>log_history</button> */}
      <button onClick={replay_gideon}>replay</button>
    </div>
  );
}
