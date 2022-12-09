import React from "react";
// import { render, screen } from "@testing-library/react";
// import App from "./App";
import { Editor } from "./Components/Codemirror/Editor";
import { render, unmountComponentAtNode } from "react-dom";

import { act } from "react-dom/test-utils";

let container: any = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

// it("renders with or without a name", () => {
//   act(() => {    render(<Editor />, container);  });  expect(container.textContent).toBe("Hey, stranger");
//   act(() => {
//     render(<Hello name="Jenny" />, container);
//   });
//   expect(container.textContent).toBe("Hello, Jenny!");

//   act(() => {
//     render(<Hello name="Margaret" />, container);
//   });
//   expect(container.textContent).toBe("Hello, Margaret!");
// });

// test("renders title xprss yrslf 2", () => {
//   render(<App />);
//   const linkElement = screen.getByText(/xprss yrslf/i);
//   expect(linkElement).toBeInTheDocument();
// })
