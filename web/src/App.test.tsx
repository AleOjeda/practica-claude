import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("muestra la pantalla de usuarios", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("[]", { status: 200 })),
    );
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Usuarios", level: 1 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Todavía no hay usuarios."),
    ).toBeInTheDocument();
  });
});
