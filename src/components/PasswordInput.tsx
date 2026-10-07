"use client";

import { useState } from "react";

export function PasswordInput({ id = "password", name = "password" }: { id?: string; name?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required
        autoComplete="current-password"
        aria-describedby={`${id}-hint`}
      />
      <button
        className="password-toggle"
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {visible ? "Ocultar" : "Mostrar"}
      </button>
    </div>
  );
}
