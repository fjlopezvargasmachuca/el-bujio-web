"use client";

import { useState } from "react";

function open(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=720,height=640");
}

export function ShareButtons() {
  const [message, setMessage] = useState("");

  function shareUrl() {
    return window.location.origin;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setMessage("Enlace copiado");
    } catch {
      setMessage("No se pudo copiar automáticamente. Mantén pulsado sobre la dirección del navegador para copiarla.");
    }
    window.setTimeout(() => setMessage(""), 4500);
  }

  function encoded() {
    const url = encodeURIComponent(shareUrl());
    const text = encodeURIComponent("Descubre la carta, el menú del día y las ofertas de Venta El Bujio.");
    return { url, text };
  }

  return (
    <div className="share-block">
      <div className="share-buttons" aria-label="Compartir El Bujio">
        <button type="button" onClick={() => { const { url, text } = encoded(); open(`https://wa.me/?text=${text}%20${url}`); }}>WhatsApp</button>
        <button type="button" onClick={() => { const { url } = encoded(); open(`https://www.facebook.com/sharer/sharer.php?u=${url}`); }}>Facebook</button>
        <button type="button" onClick={() => { const { url, text } = encoded(); open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`); }}>X</button>
        <button type="button" onClick={() => { const { url, text } = encoded(); open(`https://t.me/share/url?url=${url}&text=${text}`); }}>Telegram</button>
        <button type="button" onClick={copy}>Copiar enlace</button>
      </div>
      <div className="share-feedback" aria-live="polite">{message}</div>
    </div>
  );
}
