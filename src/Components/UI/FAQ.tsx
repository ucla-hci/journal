import React from "react";

import ClearIcon from "@mui/icons-material/Clear";
import { IconButton } from "@mui/material";

interface FAQprops {
  setViewHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FAQ({ setViewHelp }: FAQprops) {
  return (
    <div className="FAQ">
      <IconButton
        onClick={() => {
          setViewHelp(false);
        }}
        color="inherit"
      >
        <ClearIcon />
      </IconButton>
      <div>
        <h2>Frequently Asked Questions</h2>
        <p>What will happen to my data?</p>
        <p>Am I being monitored while I use this platform?</p>
      </div>
    </div>
  );
}
