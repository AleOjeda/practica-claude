import { useEffect, useState } from "react";
import { listarUsuarios, type Usuario } from "../../api/usuarios";
import { UsuarioForm } from "../UsuarioForm";
import styles from "./UsuariosPage.module.css";

// Fusiona la lista del servidor con lo que ya hay en pantalla, para no perder
// usuarios creados mientras la carga estaba en curso.
function fusionar(datos: Usuario[], actuales: Usuario[]): Usuario[] {
  const ids = new Set(datos.map((u) => u.id));
  return [...datos, ...actuales.filter((u) => !ids.has(u.id))];
}

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cada vez que cambia, se dispara una nueva carga (montaje y "Reintentar").
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    listarUsuarios(controller.signal).then(
      (datos) => {
        if (controller.signal.aborted) return;
        setUsuarios((actuales) => fusionar(datos, actuales));
        setError(null);
        setCargando(false);
      },
      (err: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "No se pudo cargar la lista",
        );
        setCargando(false);
      },
    );

    return () => controller.abort();
  }, [intento]);

  function handleReintentar() {
    setCargando(true);
    setError(null);
    setIntento((n) => n + 1);
  }

  function handleCreado(usuario: Usuario) {
    setUsuarios((actuales) => [...actuales, usuario]);
  }

  return (
    <main className={styles.pagina}>
      <h1 className={styles.titulo}>Usuarios</h1>

      <section aria-label="Lista de usuarios">
        {cargando && <p role="status">Cargando usuarios…</p>}

        {!cargando && error && (
          <div role="alert" className={styles.error}>
            <p>{error}</p>
            <button
              type="button"
              className={styles.boton}
              onClick={handleReintentar}
            >
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && usuarios.length === 0 && (
          <p className={styles.vacio}>Todavía no hay usuarios.</p>
        )}

        {/* La lista se muestra aunque haya error, para ver los usuarios
            creados con el formulario después de una carga fallida. */}
        {!cargando && usuarios.length > 0 && (
          <ul className={styles.lista}>
            {usuarios.map((u) => (
              <li key={u.id} className={styles.item}>
                <span className={styles.nombre}>{u.nombre}</span>
                <span className={styles.email}>{u.email}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <UsuarioForm onCreado={handleCreado} />
    </main>
  );
}
