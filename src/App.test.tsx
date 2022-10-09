import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders title xprss yrslf 2", () => {
  render(<App />);
  const linkElement = screen.getByText(/xprss yrslf/i);
  expect(linkElement).toBeInTheDocument();
});
