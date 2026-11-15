import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { crearUsuario } from "../../api/usuarios";
import { UsuarioForm } from ".";

vi.mock("../../api/usuarios", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../api/usuarios")>()),
  crearUsuario: vi.fn(),
}));

const crearUsuarioMock = vi.mocked(crearUsuario);

function completarYEnviar(nombre: string, email: string) {
  fireEvent.change(screen.getByLabelText("Nombre"), {
    target: { value: nombre },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.click(screen.getByRole("button", { name: "Crear usuario" }));
}

describe("UsuarioForm", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza los campos y el botón", () => {
    render(<UsuarioForm onCreado={vi.fn()} />);
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear usuario" })).toBeEnabled();
  });

  it("crea el usuario, avisa al padre y limpia el formulario", async () => {
    const creado = { id: 1, nombre: "Ana", email: "ana@ejemplo.com" };
    crearUsuarioMock.mockResolvedValue(creado);
    const onCreado = vi.fn();
    render(<UsuarioForm onCreado={onCreado} />);

    completarYEnviar("Ana", "ana@ejemplo.com");

    expect(screen.getByRole("button", { name: "Creando…" })).toBeDisabled();
    expect(
      await screen.findByRole("button", { name: "Crear usuario" }),
    ).toBeEnabled();
    expect(crearUsuarioMock).toHaveBeenCalledWith({
      nombre: "Ana",
      email: "ana@ejemplo.com",
    });
    expect(onCreado).toHaveBeenCalledWith(creado);
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("");
  });

  it("muestra el error del servidor y conserva los datos", async () => {
    crearUsuarioMock.mockRejectedValue(new Error("El email no es válido"));
    const onCreado = vi.fn();
    render(<UsuarioForm onCreado={onCreado} />);

    completarYEnviar("Ana", "ana@ejemplo.com");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El email no es válido",
    );
    expect(onCreado).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Ana");
  });
});
