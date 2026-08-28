"use client";

import { useState } from "react";

type View =
  | "resumen"
  | "proveedores"
  | "conversaciones"
  | "oportunidades"
  | "costes";

const nav: { id: View; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "proveedores", label: "Proveedores" },
  { id: "conversaciones", label: "Conversaciones" },
  { id: "oportunidades", label: "Oportunidades" },
  { id: "costes", label: "Costes y margen" },
];

const emptyCopy: Record<Exclude<View, "resumen">, { eyebrow: string; title: string; description: string }> = {
  proveedores: {
    eyebrow: "RED DE SUMINISTRO",
    title: "Todavía no hay proveedores",
    description: "Aquí aparecerán únicamente los proveedores reales que se registren en Attempo.",
  },
  conversaciones: {
    eyebrow: "BANDEJA DE INSTAGRAM",
    title: "Preparando las conversaciones reales",
    description: "Los mensajes recibidos por Instagram se mostrarán aquí cuando el acceso privado esté habilitado.",
  },
  oportunidades: {
    eyebrow: "PIPELINE COMERCIAL",
    title: "Todavía no hay oportunidades",
    description: "Las oportunidades aparecerán cuando se creen a partir de contactos, eventos o negociaciones reales.",
  },
  costes: {
    eyebrow: "COSTE REAL",
    title: "Todavía no hay escenarios de coste",
    description: "Esta sección se completará cuando existan precios y condiciones confirmados de proveedores reales.",
  },
};

export default function Home() {
  const [view, setView] = useState<View>("resumen");

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="mark">A</span>
          <div><strong>ATTEMPO</strong><span>CONTROL</span></div>
        </div>
        <nav aria-label="Navegación principal">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={view === item.id ? "active" : ""}
            >
              <span className="nav-dot" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="agent-state"><i /> Integración Instagram <span>Activa</span></div>
          <div className="profile">
            <span>AM</span>
            <div><strong>Attempo</strong><small>Administración</small></div>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p>ATTEMPO · OPERACIONES</p>
            <h1>{nav.find((item) => item.id === view)?.label}</h1>
          </div>
          <div className="live-source"><i /> Datos reales</div>
        </header>

        {view === "resumen" ? <Summary /> : <EmptyView view={view} />}
      </section>
    </main>
  );
}

function Summary() {
  return (
    <>
      <section className="goal-strip clean-strip">
        <div>
          <span>ESTADO DEL SISTEMA</span>
          <h2>Attempo Control está conectado</h2>
          <p>La interfaz mostrará exclusivamente información real almacenada en Supabase.</p>
        </div>
        <div className="connection-badge"><i /> Instagram conectado</div>
      </section>

      <section className="metrics">
        <Metric label="Proveedores" />
        <Metric label="Conversaciones visibles" />
        <Metric label="Oportunidades" />
        <Metric label="Escenarios de coste" />
      </section>

      <section className="panel full-panel empty-dashboard">
        <div className="empty-mark">A</div>
        <span>BASE DE DATOS LIMPIA</span>
        <h2>Sin datos de demostración</h2>
        <p>
          Los paneles se completarán automáticamente a medida que entren mensajes,
          proveedores, presupuestos y oportunidades reales.
        </p>
      </section>
    </>
  );
}

function Metric({ label }: { label: string }) {
  return (
    <article>
      <div><span>{label}</span></div>
      <strong>0</strong>
      <small>Sin registros visibles</small>
    </article>
  );
}

function EmptyView({ view }: { view: Exclude<View, "resumen"> }) {
  const copy = emptyCopy[view];
  return (
    <section className="panel full-panel empty-dashboard">
      <div className="empty-mark">A</div>
      <span>{copy.eyebrow}</span>
      <h2>{copy.title}</h2>
      <p>{copy.description}</p>
    </section>
  );
}
