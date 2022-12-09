import React from "react";

import ClearIcon from "@mui/icons-material/Clear";
import { IconButton } from "@mui/material";

interface FAQprops {
  setViewHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FAQ({ setViewHelp }: FAQprops) {
  return (
    <div className="FAQ" style={{ position: "relative" }}>
      <div
        className="functional-layer"
        style={{
          position: "absolute",
          width: "100%",
          zIndex: 2,
        }}
      >
        <IconButton
          onClick={() => {
            setViewHelp(false);
          }}
          color="inherit"
          style={{ backgroundColor: "transparent" }}
        >
          <ClearIcon />
        </IconButton>
        <div
          className="modaltext-content"
          style={{
            display: "flex",
            flexDirection: "row",
            // justifyContent: "space-evenly",
            marginLeft: "80px",
          }}
        >
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              // margin: "80px",
              flex: 1,
            }}
          >
            <h1>Frequently Asked Questions:</h1>
            <br />
            <h3>Is my writing private?</h3>
            <p>
              Yes, your writing is private. It is stored locally within your
              browser, so it is not shared with anyone else unless you choose to
              manually download the logs and share them. Just be careful not to
              clear your browsing history or cache, as this could delete your
              writing.
            </p>
            <h3>Am I being monitored while I use this platform?</h3>
            <p>
              Expresso+ logs your platform usage in a minimal way and stores it
              locally on your computer. You have full autonomy to share the log
              files with us (highly recommended).
            </p>
            <h3>What is the difference between Logs and Lite Logs?</h3>
            <p>
              We understand the writing in this platform may be very personal.
              Since we still want to understand how you interact with the
              platform, this logging option omits all writing from the logs. It
              only exports feature use and less sensitive data (such as
              wordcount or writing duration etc).
            </p>
            <h3>Can I trust the results of the writing analysis?</h3>
            <p>
              Yes, but please be cautious that this experimental platform might
              provide wrong feedback. These errors mainly appear due to a lack
              of full context awareness. Regardless of this, we have designed
              the system to best identify different thought patterns based on
              targeted phrases.{" "}
            </p>
            <h3>What should I do if I get wrong feedback?</h3>
            <p>
              There is a <i>Dismiss</i> button that will hide wrong suggestions.
              This helps you keep only the useful feedback. <br />
            </p>
          </div>
          <div
            style={{
              marginLeft: "80px",
              fontFamily: "'Inter', sans-serif",
              flex: 1,
            }}
          >
            <h1>Contacts:</h1>
            <br />
            <h3>Emergency Numbers:</h3>
            <p>
              National Suicide Prevention Lifeline toll-free at{" "}
              <b>1-800-273-TALK (8255)</b>
            </p>
            <h3>Expresso+ Developers:</h3>
            <p
              onClick={(e) => {
                window.location.href = "mailto:hci@ucla.edu";
                e.preventDefault();
              }}
              style={{ textDecoration: "underline", cursor: "pointer" }}
            >
              hci@ucla.edu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
