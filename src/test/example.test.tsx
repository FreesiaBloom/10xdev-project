import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

describe("Example Component", () => {
  it("should render a div with text", () => {
    render(<div>Hello Vitest!</div>);
    expect(screen.getByText("Hello Vitest!")).toBeInTheDocument();
  });
});
