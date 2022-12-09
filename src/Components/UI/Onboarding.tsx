import React from "react";

export default function Onboarding() {
  return (
    <div style={{ textAlign: "left", width: "88%" }}>
      <h1>Thanks for trying out Expresso+!</h1>
      <p>
        Here, you can use writing as a tool to explore your thoughts, feelings,
        and experiences. This can be a powerful way to process difficult
        emotions and gain insight into your mental health.
      </p>
      <p>
        To get started, simply create a new entry and begin writing. You can
        write about whatever is on your mind, but Expresso+ works best if you
        write about feelings, challenges, or concerns you might have at the
        moment.
      </p>
      <p>
        In addition to the immediate benefits of writing, regularly practicing
        expressive writing can also have long-term mental health benefits.
        Research has shown that expressive writing can help to reduce stress,
        improve mood, and even boost your immune system. It can also be a
        powerful tool for self-discovery and personal growth.
      </p>
      <br />
      <h3 style={{ fontWeight: 400, color: "rgba(100,100,150,0.8)" }}>
        Overview of the novel Features:{" "}
      </h3>
      <div
        style={{
          margin: "0px 10px 0px 36px",
          color: "rgba(100,100,150,0.8)",
          width: "fit-content",
        }}
      >
        <h2 style={{ fontWeight: 400, marginTop: "0px" }}>Expresso</h2>
        <ul>
          <li>Suggestions to encourage continuous writing</li>
          <li>Does not allow single key completion to encourage mindfulness</li>
        </ul>
        <h2 style={{ fontWeight: 400 }}>Analysis</h2>
        <ul>
          <li>
            Detection of words of phrases that may suggest mental health
            patterns
          </li>
          <li>
            Clicking on marks prompt feedback which can be further inquired
            (with the "More" button), or "Dismissed" if irrelevant
          </li>
          <li>
            Words can be reframed if the button is available on the right
            sidebar
          </li>
        </ul>
        <h2 style={{ fontWeight: 400 }}>Reframing</h2>
        <ul>
          <li>
            Challenge unhelpful thought patterns and reframe thoughts in a more
            positive light
          </li>
        </ul>
      </div>

      <br />

      <p>
        We hope that you enjoy using our app and that writing becomes a valuable
        part of your self-care routine.
      </p>

      <h2 style={{ fontWeight: 400 }}>Happy writing!</h2>

      {/* <p>
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
      </p> */}
    </div>
  );
}
