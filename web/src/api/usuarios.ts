export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export interface NuevoUsuario {
  nombre: string;
  email: string;
}

// Deben coincidir con MAX_NOMBRE y MAX_EMAIL de src/services/usuariosService.js
export const MAX_NOMBRE = 100;
export const MAX_EMAIL = 254;

const BASE_URL = "/usuarios";

function esUsuario(x: unknown): x is Usuario {
  return (
    typeof x === "object" &&
    x !== null &&
    "id" in x &&
    typeof x.id === "number" &&
    "nombre" in x &&
    typeof x.nombre === "string" &&
    "email" in x &&
    typeof x.email === "string"
  );
}

async function pedir(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new Error("No se pudo conectar con el servidor");
  }
}

async function leerJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    throw new Error("Respuesta inválida del servidor");
  }
}

async function leerError(res: Response): Promise<string> {
  try {
    const cuerpo: unknown = await res.json();
    if (
      typeof cuerpo === "object" &&
      cuerpo !== null &&
      "error" in cuerpo &&
      typeof cuerpo.error === "string"
    ) {
      return cuerpo.error;
    }
  } catch {
    // La respuesta no era JSON; se usa el mensaje genérico.
  }
  return `Error ${res.status} al comunicarse con el servidor`;
}

export async function listarUsuarios(signal?: AbortSignal): Promise<Usuario[]> {
  const res = await pedir(BASE_URL, { signal });
  if (!res.ok) {
    throw new Error(await leerError(res));
  }
  const datos = await leerJson(res);
  if (!Array.isArray(datos) || !datos.every(esUsuario)) {
    throw new Error("Respuesta inválida del servidor");
  }
  return datos;
}

export async function crearUsuario(datos: NuevoUsuario): Promise<Usuario> {
  const res = await pedir(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    throw new Error(await leerError(res));
  }
  const usuario = await leerJson(res);
  if (!esUsuario(usuario)) {
    throw new Error("Respuesta inválida del servidor");
  }
  return usuario;
}
