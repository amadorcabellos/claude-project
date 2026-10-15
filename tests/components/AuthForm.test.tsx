import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";

// component imports
import AuthForm from "@/components/AuthForm";

describe("AuthForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the login fields and submit button", () => {
    render(<AuthForm mode="login" />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("renders the signup submit button", () => {
    render(<AuthForm mode="signup" />);

    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();
  });

  it("toggles password visibility without submitting", async () => {
    const user = userEvent.setup();
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<AuthForm mode="login" />);

    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password).toHaveAttribute("type", "password");
    expect(log).not.toHaveBeenCalled();
  });

  it("logs the trimmed details on submit and clears the form", async () => {
    const user = userEvent.setup();
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText("Email"), "  fox@heist.io  ");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(log).toHaveBeenCalledWith("signup submitted", {
      email: "fox@heist.io",
      password: "secret",
    });
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });

  it("links each mode to the other form", () => {
    const { unmount } = render(<AuthForm mode="login" />);
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/signup",
    );
    unmount();

    render(<AuthForm mode="signup" />);
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
