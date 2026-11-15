import { afterEach, describe, expect, it, vi } from "vitest";
import { crearUsuario, listarUsuarios } from "./usuarios";

const ANA = { id: 1, nombre: "Ana", email: "ana@ejemplo.com" };
const LUIS = { id: 2, nombre: "Luis", email: "luis@ejemplo.com" };

function respuestaJson(cuerpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function respuestaTexto(texto: string, status: number): Response {
  return new Response(texto, {
    status,
    headers: { "Content-Type": "text/html" },
  });
}

function mockFetch(impl: () => Promise<Response>) {
  const fetchMock = vi.fn(impl);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listarUsuarios", () => {
  it("devuelve la lista y pide GET /usuarios con la señal", async () => {
    const fetchMock = mockFetch(async () => respuestaJson([ANA, LUIS]));
    const controller = new AbortController();

    await expect(listarUsuarios(controller.signal)).resolves.toEqual([
      ANA,
      LUIS,
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("/usuarios");
    expect(init.method ?? "GET").toBe("GET");
    expect(init.signal).toBe(controller.signal);
  });

  it("propaga el mensaje {error} del servidor", async () => {
    mockFetch(async () => respuestaJson({ error: "Algo salió mal" }, 400));
    await expect(listarUsuarios()).rejects.toThrow("Algo salió mal");
  });

  it("usa un mensaje genérico con el status si el error no es JSON", async () => {
    mockFetch(async () => respuestaTexto("<h1>Bad Gateway</h1>", 502));
    await expect(listarUsuarios()).rejects.toThrow(
      "Error 502 al comunicarse con el servidor",
    );
  });

  it("usa un mensaje genérico si el error es JSON sin campo error", async () => {
    mockFetch(async () => respuestaJson({ mensaje: "otra cosa" }, 500));
    await expect(listarUsuarios()).rejects.toThrow(
      "Error 500 al comunicarse con el servidor",
    );
  });

  it("rechaza una respuesta 200 que no es JSON", async () => {
    mockFetch(async () => respuestaTexto("<html></html>", 200));
    await expect(listarUsuarios()).rejects.toThrow(
      "Respuesta inválida del servidor",
    );
  });

  it("rechaza una respuesta que no es un array", async () => {
    mockFetch(async () => respuestaJson({ usuarios: [ANA] }));
    await expect(listarUsuarios()).rejects.toThrow(
      "Respuesta inválida del servidor",
    );
  });

  it("rechaza una respuesta con elementos mal formados", async () => {
    mockFetch(async () =>
      respuestaJson([ANA, { id: "2", nombre: "Luis", email: "l@e.com" }]),
    );
    await expect(listarUsuarios()).rejects.toThrow(
      "Respuesta inválida del servidor",
    );
  });

  it("rechaza una respuesta con elementos null", async () => {
    mockFetch(async () => respuestaJson([null]));
    await expect(listarUsuarios()).rejects.toThrow(
      "Respuesta inválida del servidor",
    );
  });

  it("traduce un error de red a un mensaje legible", async () => {
    mockFetch(async () => {
      throw new TypeError("Failed to fetch");
    });
    await expect(listarUsuarios()).rejects.toThrow(
      "No se pudo conectar con el servidor",
    );
  });

  it("propaga el AbortError tal cual", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    mockFetch(async () => {
      throw abortError;
    });
    await expect(listarUsuarios()).rejects.toBe(abortError);
  });
});

describe("crearUsuario", () => {
  const datos = { nombre: "Eva", email: "eva@ejemplo.com" };
  const EVA = { id: 7, ...datos };

  it("envía POST con headers y body JSON y devuelve el usuario", async () => {
    const fetchMock = mockFetch(async () => respuestaJson(EVA, 201));

    await expect(crearUsuario(datos)).resolves.toEqual(EVA);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("/usuarios");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body as string)).toEqual(datos);
  });

  it("propaga el mensaje {error} de un 400", async () => {
    mockFetch(async () =>
      respuestaJson({ error: "El email no es válido" }, 400),
    );
    await expect(crearUsuario(datos)).rejects.toThrow("El email no es válido");
  });

  it("usa un mensaje genérico con el status si el error no es JSON", async () => {
    mockFetch(async () => respuestaTexto("Internal Server Error", 500));
    await expect(crearUsuario(datos)).rejects.toThrow(
      "Error 500 al comunicarse con el servidor",
    );
  });

  it("rechaza una respuesta exitosa que no es JSON", async () => {
    mockFetch(async () => respuestaTexto("ok", 201));
    await expect(crearUsuario(datos)).rejects.toThrow(
      "Respuesta inválida del servidor",
    );
  });

  it("rechaza una respuesta exitosa que no es un usuario", async () => {
    mockFetch(async () => respuestaJson({ id: 7, nombre: "Eva" }, 201));
    await expect(crearUsuario(datos)).rejects.toThrow(
      "Respuesta inválida del servidor",
    );
  });

  it("traduce un error de red a un mensaje legible", async () => {
    mockFetch(async () => {
      throw new TypeError("Failed to fetch");
    });
    await expect(crearUsuario(datos)).rejects.toThrow(
      "No se pudo conectar con el servidor",
    );
  });

  it("propaga el AbortError tal cual", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    mockFetch(async () => {
      throw abortError;
    });
    await expect(crearUsuario(datos)).rejects.toBe(abortError);
  });
});
