import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./button";
import { expect, test, vi } from "vitest";

test("renders and clicks the button", () => {
  const handleClick = vi.fn();

  render(
    <Button bgColor="green" onClick={handleClick}>
      Click me
    </Button>,
  );
  const button = screen.getByRole("button", { name: /click me/i });

  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(handleClick).toHaveBeenCalledTimes(1);
});
