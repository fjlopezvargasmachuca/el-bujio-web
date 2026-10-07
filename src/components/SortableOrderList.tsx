"use client";

import { useEffect, useState, useTransition } from "react";
import { reorderMenuItems, reorderSpecialItems } from "@/app/admin/(protected)/actions";

type Item = {
  id: string;
  label: string;
  meta?: string;
};

export function SortableOrderList({
  items,
  kind,
}: {
  items: Item[];
  kind: "menu" | "special";
}) {
  const [ordered, setOrdered] = useState(items);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setOrdered(items);
  }, [items]);

  function persist(next: Item[]) {
    setOrdered(next);
    startTransition(async () => {
      const ids = next.map((item) => item.id);
      if (kind === "menu") {
        await reorderMenuItems(ids);
      } else {
        await reorderSpecialItems(ids);
      }
    });
  }

  function moveItem(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    const from = ordered.findIndex((item) => item.id === draggedId);
    const to = ordered.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;

    const next = [...ordered];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setDraggedId(null);
    persist(next);
  }

  function moveBy(id: string, direction: -1 | 1) {
    const index = ordered.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ordered.length) return;
    const next = [...ordered];
    [next[index], next[target]] = [next[target], next[index]];
    persist(next);
  }

  if (!ordered.length) return <div className="muted">No hay elementos para ordenar.</div>;

  return (
    <div>
      <div className="sortable-help">Arrastra cada fila desde el icono ⋮⋮. En móvil también puedes usar las flechas. El orden se guarda automáticamente.</div>
      <div className="sortable-list">
        {ordered.map((item, index) => (
          <div
            className={`sortable-row ${draggedId === item.id ? "dragging" : ""}`}
            draggable
            key={item.id}
            onDragStart={() => setDraggedId(item.id)}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => moveItem(item.id)}
          >
            <span className="drag-handle" aria-hidden="true">⋮⋮</span>
            <span className="sortable-label">{item.label}</span>
            {item.meta ? <span className="sortable-meta">{item.meta}</span> : null}
            <span className="sort-buttons">
              <button type="button" onClick={() => moveBy(item.id, -1)} disabled={index === 0} aria-label={`Subir ${item.label}`}>↑</button>
              <button type="button" onClick={() => moveBy(item.id, 1)} disabled={index === ordered.length - 1} aria-label={`Bajar ${item.label}`}>↓</button>
            </span>
          </div>
        ))}
      </div>
      <div className="sortable-status">{isPending ? "Guardando orden…" : "Orden guardado"}</div>
    </div>
  );
}
