import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { crearUsuario, listarUsuarios } from "../../api/usuarios";
import { UsuariosPage } from ".";

vi.mock("../../api/usuarios", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../api/usuarios")>()),
  listarUsuarios: vi.fn(),
  crearUsuario: vi.fn(),
}));

const listarMock = vi.mocked(listarUsuarios);
const crearMock = vi.mocked(crearUsuario);

describe("UsuariosPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el estado de carga y luego la lista", async () => {
    listarMock.mockResolvedValue([
      { id: 1, nombre: "Ana", email: "ana@ejemplo.com" },
      { id: 2, nombre: "Luis", email: "luis@ejemplo.com" },
    ]);
    render(<UsuariosPage />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando usuarios…");
    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("Ana")).toBeInTheDocument();
    expect(within(items[1]).getByText("luis@ejemplo.com")).toBeInTheDocument();
  });

  it("muestra un mensaje si no hay usuarios", async () => {
    listarMock.mockResolvedValue([]);
    render(<UsuariosPage />);
    expect(
      await screen.findByText("Todavía no hay usuarios."),
    ).toBeInTheDocument();
  });

  it("muestra el error y permite reintentar", async () => {
    listarMock
      .mockRejectedValueOnce(new Error("No se pudo conectar con el servidor"))
      .mockResolvedValueOnce([
        { id: 1, nombre: "Ana", email: "ana@ejemplo.com" },
      ]);
    render(<UsuariosPage />);

    const alerta = await screen.findByRole("alert");
    expect(alerta).toHaveTextContent("No se pudo conectar con el servidor");

    fireEvent.click(within(alerta).getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(listarMock).toHaveBeenCalledTimes(2);
  });

  it("agrega a la lista el usuario creado con el formulario", async () => {
    listarMock.mockResolvedValue([]);
    crearMock.mockResolvedValue({
      id: 7,
      nombre: "Eva",
      email: "eva@ejemplo.com",
    });
    render(<UsuariosPage />);
    await screen.findByText("Todavía no hay usuarios.");

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Eva" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "eva@ejemplo.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear usuario" }));

    const item = await screen.findByRole("listitem");
    expect(item).toHaveTextContent("Eva");
    expect(item).toHaveTextContent("eva@ejemplo.com");
  });

  it("muestra el usuario creado aunque la carga inicial haya fallado", async () => {
    listarMock.mockRejectedValue(
      new Error("No se pudo conectar con el servidor"),
    );
    crearMock.mockResolvedValue({
      id: 9,
      nombre: "Eva",
      email: "eva@ejemplo.com",
    });
    render(<UsuariosPage />);

    const lista = screen.getByRole("region", { name: "Lista de usuarios" });
    const alerta = await within(lista).findByRole("alert");
    expect(alerta).toHaveTextContent("No se pudo conectar con el servidor");

    fireEvent.change(screen.getByLabelText("Nombre"), {
      target: { value: "Eva" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "eva@ejemplo.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear usuario" }));

    const item = await within(lista).findByRole("listitem");
    expect(item).toHaveTextContent("Eva");
    expect(item).toHaveTextContent("eva@ejemplo.com");
    expect(within(lista).getByRole("alert")).toHaveTextContent(
      "No se pudo conectar con el servidor",
    );
    expect(
      screen.queryByText("Todavía no hay usuarios."),
    ).not.toBeInTheDocument();
    expect(listarMock).toHaveBeenCalledTimes(1);
  });
});
