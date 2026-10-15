import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";

function ThemeControls() {
  const { theme, setTheme } = useTheme();
  return <><span data-testid="mode">{theme}</span><button onClick={() => setTheme("dark")}>Dark</button><button onClick={() => setTheme("light")}>Light</button></>;
}

afterEach(() => { cleanup(); localStorage.clear(); document.documentElement.classList.remove("dark"); });

describe("Appearance settings", () => {
  it("applies and saves dark mode", async () => {
    render(<ThemeProvider><ThemeControls /></ThemeProvider>);
    fireEvent.click(screen.getByText("Dark"));
    await waitFor(() => expect(document.documentElement.classList.contains("dark")).toBe(true));
    expect(localStorage.getItem("wpa.theme")).toBe('"dark"');
  });
  it("applies and saves light mode", async () => {
    localStorage.setItem("wpa.theme", '"dark"');
    render(<ThemeProvider><ThemeControls /></ThemeProvider>);
    await waitFor(() => expect(document.documentElement.classList.contains("dark")).toBe(true));
    fireEvent.click(screen.getByText("Light"));
    await waitFor(() => expect(document.documentElement.classList.contains("dark")).toBe(false));
    expect(localStorage.getItem("wpa.theme")).toBe('"light"');
  });
  it("restores the saved mode on a subsequent visit", async () => {
    localStorage.setItem("wpa.theme", '"dark"');
    render(<ThemeProvider><ThemeControls /></ThemeProvider>);
    await waitFor(() => expect(screen.getByTestId("mode").textContent).toBe("dark"));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});