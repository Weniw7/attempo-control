"use client";

import { useMemo, useState } from "react";

type View = "resumen" | "proveedores" | "conversaciones" | "oportunidades" | "costes";

const suppliers = [
  { name: "SPUGA Sports Wear", country: "Pakistán", unit: 7.8, moq: 30, gsm: "280–300", lead: "18–24 días", score: 86, status: "Muestra pendiente" },
  { name: "Lusitano Textile Co.", country: "Portugal", unit: 11.4, moq: 60, gsm: "220–260", lead: "12–18 días", score: 79, status: "Primer contacto" },
  { name: "Hangzhou Cotton Lab", country: "China", unit: 4.95, moq: 200, gsm: "180–220", lead: "25–35 días", score: 72, status: "Validar calidad" },
  { name: "Proveedor actual", country: "España", unit: 16.2, moq: 50, gsm: "240", lead: "10–14 días", score: 61, status: "Activo" },
];

const conversations = [
  { initials: "AR", name: "Ali Raza", kind: "Proveedor", time: "Hace 18 min", text: "Podemos fabricar la muestra en 300 GSM. ¿Confirmáis bordado frontal y print trasero?" },
  { initials: "MA", name: "Marcos Astolfi", kind: "Evento", time: "Hace 1 h", text: "La finca confirma el espacio junto a la zona de copas. Necesitamos logo final para el flyer." },
  { initials: "JL", name: "Joaquín Lucena", kind: "Colaboración", time: "Ayer", text: "Cuando queráis preparamos contenido para YouTube e Instagram con vuestras prendas." },
];

const nav: { id: View; label: string; count?: number }[] = [
  { id: "resumen", label: "Resumen" }, { id: "proveedores", label: "Proveedores", count: 12 },
  { id: "conversaciones", label: "Conversaciones", count: 3 }, { id: "oportunidades", label: "Oportunidades", count: 7 },
  { id: "costes", label: "Costes y margen" },
];

function Trend({ good = true }: { good?: boolean }) { return <span className={good ? "trend good" : "trend warn"}>{good ? "↘" : "↗"}</span>; }

export default function Home() {
  const [view, setView] = useState<View>("resumen");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const filtered = useMemo(() => suppliers.filter((s) => `${s.name} ${s.country}`.toLowerCase().includes(query.toLowerCase())), [query]);
  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2600); }

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="mark">A</span><div><strong>ATTEMPO</strong><span>CONTROL</span></div></div>
      <nav aria-label="Navegación principal">{nav.map((item) => <button key={item.id} onClick={() => setView(item.id)} className={view === item.id ? "active" : ""}><span className="nav-dot" />{item.label}{item.count && <b>{item.count}</b>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="agent-state"><i /> Agente Attempo <span>Activo</span></div><div className="profile"><span>AM</span><div><strong>Alfonso & equipo</strong><small>Administración</small></div><b>···</b></div></div>
    </aside>

    <section className="workspace">
      <header className="topbar"><div><p>ATTEMPO · OPERACIONES</p><h1>{nav.find((n) => n.id === view)?.label}</h1></div><div className="top-actions"><button className="icon-btn" aria-label="Notificaciones">●<span /></button><button className="primary" onClick={() => notify("Nueva oportunidad preparada")}>＋ Nueva oportunidad</button></div></header>

      {view === "resumen" && <>
        <section className="goal-strip"><div><span>OBJETIVO PRINCIPAL</span><h2>Recuperar la rentabilidad por prenda</h2><p>Reducir el coste base manteniendo la calidad premium de Attempo.</p></div><div className="goal-numbers"><div><small>Coste actual</small><strong>16,20 €</strong></div><span>→</span><div className="target"><small>Objetivo</small><strong>≤ 7,00 €</strong></div><div className="saving"><small>Ahorro potencial</small><strong>−56,8%</strong></div></div></section>
        <section className="metrics"><article><div><span>Coste medio localizado</span><Trend /></div><strong>8,72 €</strong><small>−2,14 € este mes</small></article><article><div><span>Proveedores activos</span><Trend /></div><strong>12</strong><small>4 en negociación</small></article><article><div><span>Oportunidades abiertas</span><Trend good={false} /></div><strong>7</strong><small>Valor estimado 4.850 €</small></article><article><div><span>Margen estimado</span><Trend /></div><strong>62,4%</strong><small>Objetivo mínimo 60%</small></article></section>
        <section className="dashboard-grid">
          <article className="panel cost-panel"><div className="panel-title"><div><span>EVOLUCIÓN</span><h3>Coste por camiseta</h3></div><button>Últimos 6 meses⌄</button></div><div className="chart"><div className="axis"><span>18 €</span><span>14 €</span><span>10 €</span><span>6 €</span></div><svg viewBox="0 0 620 190" preserveAspectRatio="none" aria-label="Coste por camiseta descendente"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#707558" stopOpacity=".26"/><stop offset="1" stopColor="#707558" stopOpacity="0"/></linearGradient></defs><path className="gridline" d="M0 25H620 M0 75H620 M0 125H620 M0 175H620"/><path className="area" d="M0 30 C85 32 110 43 155 47 S245 76 310 82 S408 107 465 112 S545 133 620 145 L620 190 L0 190Z"/><path className="line" d="M0 30 C85 32 110 43 155 47 S245 76 310 82 S408 107 465 112 S545 133 620 145"/>{[0,155,310,465,620].map((x,i)=><circle key={x} cx={x} cy={[30,47,82,112,145][i]} r="4"/>)}</svg><div className="months"><span>MAR</span><span>ABR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AGO</span></div></div></article>
          <article className="panel agent-panel"><div className="agent-head"><span className="agent-logo">✦</span><div><span>AGENTE ATTEMPO</span><h3>3 acciones necesitan aprobación</h3></div></div>{conversations.slice(0,2).map((c) => <div className="approval" key={c.name}><div className="avatar">{c.initials}</div><div><strong>{c.name}</strong><small>{c.kind} · {c.time}</small><p>{c.text}</p><div><button onClick={() => notify(`Respuesta a ${c.name} aprobada`)}>Aprobar</button><button onClick={() => setView("conversaciones")}>Revisar</button></div></div></div>)}<button className="see-all" onClick={() => setView("conversaciones")}>Ver todas las conversaciones →</button></article>
        </section>
        <section className="panel supplier-preview"><div className="panel-title"><div><span>COMPARATIVA</span><h3>Proveedores destacados</h3></div><button onClick={() => setView("proveedores")}>Ver todos →</button></div><SupplierTable data={suppliers.slice(0,3)} /></section>
      </>}

      {view === "proveedores" && <section className="panel full-panel"><div className="section-intro"><div><span>RED DE SUMINISTRO</span><h2>Comparador de proveedores</h2><p>Decide por coste total, calidad, MOQ, plazo y riesgo; no solo por precio unitario.</p></div><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar proveedor o país…" /></div><SupplierTable data={filtered} /></section>}
      {view === "conversaciones" && <section className="panel full-panel"><div className="section-intro"><div><span>BANDEJA INTELIGENTE</span><h2>Conversaciones por aprobar</h2><p>El agente clasifica el contacto, resume el contexto y propone la siguiente acción.</p></div><button className="primary" onClick={() => notify("Bandeja actualizada")}>Actualizar bandeja</button></div><div className="conversation-list">{conversations.map((c) => <article key={c.name}><div className="avatar large">{c.initials}</div><div className="conversation-body"><div><strong>{c.name}</strong><span className="tag">{c.kind}</span><small>{c.time}</small></div><p>{c.text}</p><div className="draft"><span>✦ Respuesta recomendada</span><p>Gracias por la información. Lo revisamos con el equipo y te confirmamos hoy los siguientes pasos para avanzar.</p></div><div className="conversation-actions"><button className="approve" onClick={() => notify(`Respuesta enviada a ${c.name}`)}>Aprobar y enviar</button><button>Editar</button><button>Posponer</button></div></div></article>)}</div></section>}
      {view === "oportunidades" && <section className="panel full-panel"><div className="section-intro"><div><span>PIPELINE COMERCIAL</span><h2>Oportunidades y eventos</h2><p>Visibilidad, ingreso esperado, coste comprometido y próximo paso en una sola vista.</p></div></div><div className="kanban"><Pipeline title="Por evaluar" count={2} cards={["Distribuidor premium Portugal", "Colección universitaria nacional"]}/><Pipeline title="En negociación" count={3} cards={["Fiesta del Novato · CMU San Pablo", "Colaboración Joaquín Lucena", "Muestra SPUGA 300 GSM"]}/><Pipeline title="Confirmado" count={2} cards={["Stand + fotógrafo oficial", "Sorteo 2 prendas"]}/></div></section>}
      {view === "costes" && <section className="cost-layout"><article className="panel full-panel"><div className="section-intro"><div><span>UNIT ECONOMICS</span><h2>Constructor de coste real</h2><p>Calcula cuánto deja cada venta después de prenda, acabados, logística y colaboración.</p></div></div><div className="cost-builder">{[["Camiseta base","7,00 €"],["Estampación / bordado","2,10 €"],["Packaging premium","1,25 €"],["Transporte + aduanas","1,40 €"],["Comisiones y pasarela","2,25 €"]].map(([a,b])=><div key={a}><span>{a}</span><strong>{b}</strong></div>)}<div className="total"><span>Coste completo objetivo</span><strong>14,00 €</strong></div></div></article><article className="margin-card"><span>PVP DE REFERENCIA</span><strong>39,90 €</strong><div><small>Margen bruto</small><b>25,90 €</b></div><div><small>Margen porcentual</small><b>64,9%</b></div><p>✓ Supera el objetivo mínimo del 60%</p><button onClick={() => notify("Escenario guardado")}>Guardar escenario</button></article></section>}
    </section>{toast && <div className="toast">✓ {toast}</div>}
  </main>;
}

function SupplierTable({ data }: { data: typeof suppliers }) { return <div className="table-wrap"><table><thead><tr><th>Proveedor</th><th>Coste unidad</th><th>MOQ</th><th>Gramaje</th><th>Plazo</th><th>Puntuación</th><th>Estado</th></tr></thead><tbody>{data.map((s)=><tr key={s.name}><td><strong>{s.name}</strong><small>{s.country}</small></td><td className={s.unit <= 7 ? "best-price" : ""}>{s.unit.toFixed(2).replace(".", ",")} €</td><td>{s.moq} uds.</td><td>{s.gsm} GSM</td><td>{s.lead}</td><td><span className="score"><i style={{width:`${s.score}%`}} />{s.score}</span></td><td><span className="status">{s.status}</span></td></tr>)}</tbody></table></div>; }
function Pipeline({ title, count, cards }: { title: string; count: number; cards: string[] }) { return <div className="pipeline"><h3>{title}<span>{count}</span></h3>{cards.map((card,i)=><article key={card}><small>{i % 2 ? "COLABORACIÓN" : "OPORTUNIDAD"}</small><strong>{card}</strong><p>Próxima acción: revisión del equipo</p><div><span>Impacto</span><b>{i % 2 ? "Medio" : "Alto"}</b></div></article>)}</div>; }
