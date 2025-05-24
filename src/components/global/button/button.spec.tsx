import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./button";
import { expect, test, vi } from "vitest";

test("renders and clicks the button", () => {
  const handleClick = vi.fn();

  render(
    <Button bgColor="green" onClick={handleClick} id="test-button">
      Click me
    </Button>,
  );
  const button = screen.getByRole("button", { name: /click me/i });

  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test("button has correct background color", () => {
  const { getByRole } = render(
    <Button bgColor="green" onClick={() => {}}>
      Click me
    </Button>,
  );
  const button = getByRole("button", { name: /click me/i });
  expect(button).toHaveClass("bg-green-600");
});

test("button is disabled when contain disabled attribute", () => {
  const { getByRole } = render(
    <Button disabled onClick={() => {}}>
      Click me
    </Button>,
  );
  const button = getByRole("button", { name: /click me/i });
  expect(button).toBeDisabled();
});
