import { useState, type FormEvent } from "react";
import {
  crearUsuario,
  MAX_EMAIL,
  MAX_NOMBRE,
  type Usuario,
} from "../../api/usuarios";
import styles from "./UsuarioForm.module.css";

export interface UsuarioFormProps {
  onCreado: (usuario: Usuario) => void;
}

export function UsuarioForm({ onCreado }: UsuarioFormProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const usuario = await crearUsuario({ nombre, email });
      onCreado(usuario);
      setNombre("");
      setEmail("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear el usuario",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      aria-label="Nuevo usuario"
    >
      <h2 className={styles.subtitulo}>Nuevo usuario</h2>
      <label className={styles.campo}>
        Nombre
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          maxLength={MAX_NOMBRE}
          disabled={enviando}
        />
      </label>
      <label className={styles.campo}>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={MAX_EMAIL}
          disabled={enviando}
        />
      </label>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <button type="submit" className={styles.boton} disabled={enviando}>
        {enviando ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
