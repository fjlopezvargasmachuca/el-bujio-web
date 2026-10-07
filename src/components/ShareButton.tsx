"use client";

import { useState } from "react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  async function share() {
    const data = { title: "El Bujio", text: "Mira la carta, el menú del día y las ofertas de El Bujio.", url: window.location.origin };
    if (navigator.share) {
      await navigator.share(data).catch(() => undefined);
    } else {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }
  return <button className="button ghost" onClick={share}>{copied ? "Enlace copiado" : "Compartir"}</button>;
}
