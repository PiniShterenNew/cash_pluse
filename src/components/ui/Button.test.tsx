import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>שמור</Button>);
    expect(screen.getByRole("button", { name: "שמור" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>לחץ</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when isLoading is true", () => {
    render(<Button isLoading>שמור</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>שמור</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders all variants without crashing", () => {
    const variants = ["primary", "secondary", "ghost", "danger", "whatsapp"] as const;
    variants.forEach((variant) => {
      const { unmount } = render(<Button variant={variant}>כפתור</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
      unmount();
    });
  });
});
