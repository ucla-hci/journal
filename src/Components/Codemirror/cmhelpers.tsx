export const onChange = (payload: any) => {
  console.log("onchange", payload);

  // handle selections
  if (payload.selection.ranges.length >= 1) {
    if (payload.selection.ranges[0].from < payload.selection.ranges[0].to) {
      console.log("sel", payload.selection.ranges[0]);
    }
  }
};
