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
        style={{ position: "absolute", width: "100%", zIndex: 2 }}
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
            justifyContent: "space-evenly",
            marginLeft: "80px",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              fontFamily: "'Roboto Mono', monospace",
              // margin: "80px",
              flex: 1,
            }}
          >
            <h1>Frequently Asked Questions:</h1>
            <h3>What will happen to my data?</h3>
            <p>
              Expresso+ works fully on the browser and makes zero connections to
              external servers for processing. Everything that you type is only
              stored locally in your computer. <br />
              With that being said, you should not delete the caches for this
              site unless you want to delete all of your data.
            </p>
            <h3>Am I being monitored while I use this platform?</h3>
            <p>
              Expresso+ logs your platform usage in a minimal way AND stores it
              locally on your computer. You have full autonomy to share the log
              files with us (highly recommended).
            </p>
            <h3>What should I do if I get wrong feedback?</h3>
            <p>
              There are dismiss options that will hide wrong suggestions. This
              helps you focus on the useful feedback. <br />
              However, if the feedback is counterintuitive and you are feeling
              distressed, we recommend you stop using the platform and seek
              someone to talk to.
            </p>
          </div>
          <div
            style={{
              margin: "80px",
              fontFamily: "'Roboto Mono', monospace",
              flex: 1,
            }}
          >
            <h1>Contacts</h1>
            <h3>Emergency Numbers:</h3>
            <p>???</p>
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
      <div
        className="bg-layer"
        style={{ position: "absolute", width: "100%", filter: "blur(50px)" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 1600 800"
        >
          <rect fill="#ba66fa" width="1600" height="800" />
          <path
            fill="#cb92f7"
            d="M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2 478.4 581z"
          />
          <path
            fill="#deb9fa"
            d="M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z"
          />
          <path
            fill="#ebd4fc"
            d="M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z"
          />
          <path
            fill="#f3ebfa"
            d="M1397.5 154.8c47.2-10.6 93.6-25.3 138.6-43.8c21.7-8.9 43-18.8 63.9-29.5V0H643.4c62.9 41.7 129.7 78.2 202.1 107.4C1020.4 178.1 1214.2 196.1 1397.5 154.8z"
          />
        </svg>
      </div>
    </div>
  );
}
