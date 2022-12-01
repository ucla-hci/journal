import React from "react";

export default function Welcome() {
  return (
    <div style={{ textAlign: "left", width: "80%" }}>
      <h1>Getting Started:</h1>
      <p>
        Expresso+ is an expressive writing platform meant to provide information
        and editing assistance.
      </p>
      <p>
        Use the left menu to create entries. When editing an entry, you'll also
        be able to toggle Analysis and Editing Assistance features. In case you
        don't want <b>Editing Assistance</b> to show up automatically, you can
        press the "Stuck" button to get single assistance.
      </p>
      <h2>Analysis</h2>
      <p>
        Our text analysis will show markers near words that might suggest a
        thought pattern associated with your mental health. These markers do not
        mean that your writing is wrong. Instead, their purpose is to give you
        more insight into what your writing might mean. <br />
        You can find out more information by clicking these markers and reading
        the popups. For more information, click on the <b>More</b> button in the
        popup to open the right sidebar, which holds more detailed feedback.
      </p>
      <h2>Editing Assistance</h2>
      <p>
        <b>Editing Assistance</b> suggests some text. These phrases, words, or
        sentence pieces will help you continue writing non-stop. Expressive
        writing works best when we write with no interruptions. <br />
        Additionally, our analysis can help you reframe some words (bottom of
        the right sidebar). Doing this will help you change negative
        perspectives into not-so-negative ones.
      </p>

      <h2>Need more help?</h2>
      <p>
        The help button is at the bottom of the left menu. Here, you can refer
        back to the instructions. You can also find external resources if you
        are not feeling well as a consequence of using this platform, and need
        to talk to someone. Lastly, if there are any errors or problems with the
        platform, there is a contact email so you can reach the developers and
        tell them if something is wrong.
      </p>
    </div>
  );
}
