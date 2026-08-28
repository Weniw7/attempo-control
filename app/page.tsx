"use client";

import { useEffect, useMemo, useState } from "react";

type View = "resumen" | "proveedores" | "conversaciones" | "oportunidades" | "costes";

type DashboardData = {
  metrics: {
    suppliers: number;
    conversations: number;
    opportunities: number;
    costScenarios: number;
  };
  conversations: Array<{
    id: string;
    subject: string | null;
    classification: string | null;
    priority: string;
    status: string;
    summary: string | null;
    suggested_reply: string | null;
    last_message_at: string | null;
    contact: {
      id: string;
      full_name: string;
      company: string | null;
      contact_type: string;
      instagram_handle: string | null;
      notes: string | null;
    } | null;
    messages: Array<{
      id: string;
      direction: string;
      sender_name: string | null;
      body: string;
      sent_at: string | null;
    }>;
  }>;
  suppliers: Array<{
    id: string;
    name: string;
    country: string | null;
    currency: string;
    moq: number | null;
    gsm_min: number | null;
    gsm_max: number | null;
    materials: string[] | null;
    lead_time_min_days: number | null;
    lead_time_max_days: number | null;
    pipeline_status: string;
    next_action: string | null;
    notes: string | null;
  }>;
  opportunities: Array<{
    id: string;
    title: string;
    opportunity_type: string;
    stage: string;
    expected_revenue: number | null;
    probability: number | null;
    next_action: string | null;
    due_date: string | null;
  }>;
  generatedAt: string;
};

const nav: { id: View; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "proveedores", label: "Proveedores" },
  { id: "conversaciones", label: "Conversaciones" },
  { id: "oportunidades", label: "Oportunidades" },
  { id: "costes", label: "Costes y margen" },
];

const classificationLabel: Record<string, string> = {
  supplier_textile: "Proveedor textil",
  supplier_packaging: "Packaging",
  collaboration_influencer: "Influencer",
  collaboration_brand: "Colaboración",
  retail_distribution: "Distribución retail",
};

export default function Home() {
  const [view, setView] = useState<View>("resumen");
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
        return response.json() as Promise<DashboardData>;
      })
      .then((payload) => {
        if (active) setData(payload);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar el dashboard");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="mark">A</span>
          <div><strong>ATTEMPO</strong><span>CONTROL</span></div>
        </div>
        <nav aria-label="Navegación principal">
          {nav.map((item) => (
            <button key={item.id} onClick={() => setView(item.id)} className={view === item.id ? "active" : ""}>
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
          <div className="live-source"><i /> {data ? "Supabase en vivo" : "Conectando..."}</div>
        </header>

        {error ? <ErrorPanel error={error} /> : !data ? <LoadingPanel /> : <ViewContent view={view} data={data} />}
      </section>
    </main>
  );
}

function ViewContent({ view, data }: { view: View; data: DashboardData }) {
  if (view === "resumen") return <Summary data={data} />;
  if (view === "proveedores") return <Suppliers data={data} />;
  if (view === "conversaciones") return <Conversations data={data} />;
  if (view === "oportunidades") return <Opportunities data={data} />;
  return <EmptyPanel eyebrow="COSTE REAL" title="Todavía no hay escenarios de coste" description="Esta sección se completará cuando existan precios y condiciones confirmados en la base de datos." />;
}

function Summary({ data }: { data: DashboardData }) {
  const priorityConversations = useMemo(
    () => data.conversations.filter((item) => item.priority === "urgent" || item.priority === "high").slice(0, 5),
    [data.conversations],
  );

  return (
    <>
      <section className="goal-strip clean-strip">
        <div>
          <span>ESTADO DEL SISTEMA</span>
          <h2>Attempo Control ya está leyendo datos reales</h2>
          <p>Webhook de Instagram + histórico real importado y categorizado en Supabase.</p>
        </div>
        <div className="connection-badge"><i /> Instagram conectado</div>
      </section>

      <section className="metrics">
        <Metric label="Proveedores" value={data.metrics.suppliers} note="Registrados en Supabase" />
        <Metric label="Conversaciones visibles" value={data.metrics.conversations} note="Sin mensajes de prueba" />
        <Metric label="Oportunidades" value={data.metrics.opportunities} note="Pipeline comercial" />
        <Metric label="Escenarios de coste" value={data.metrics.costScenarios} note="Costes confirmados" />
      </section>

      <section className="dashboard-grid">
        <section className="panel supplier-preview">
          <div className="panel-title">
            <div><span>PRIORIDAD COMERCIAL</span><h3>Conversaciones a vigilar</h3></div>
          </div>
          {priorityConversations.length ? (
            <div className="conversation-list">
              {priorityConversations.map((conversation) => <ConversationPreview key={conversation.id} conversation={conversation} />)}
            </div>
          ) : (
            <p>No hay conversaciones prioritarias.</p>
          )}
        </section>

        <section className="panel">
          <div className="panel-title"><div><span>CALIDAD DEL DATO</span><h3>Origen de la información</h3></div></div>
          <p style={{ fontSize: 12, lineHeight: 1.7, color: "#65675f" }}>
            Los mensajes nuevos llegan por el webhook oficial de Meta. El histórico previo se ha importado únicamente cuando existía contenido real recuperable; los contactos sin texto literal conservan sólo un resumen confirmado, sin inventar mensajes.
          </p>
        </section>
      </section>
    </>
  );
}

function Metric({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <article>
      <div><span>{label}</span></div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function Conversations({ data }: { data: DashboardData }) {
  if (!data.conversations.length) return <EmptyPanel eyebrow="BANDEJA DE INSTAGRAM" title="Sin conversaciones" description="Los mensajes reales aparecerán aquí al entrar por Meta o al importar históricos verificados." />;

  return (
    <section className="panel full-panel">
      <div className="section-intro">
        <div><span>BANDEJA DE INSTAGRAM</span><h2>Conversaciones reales</h2><p>Clasificadas por tipo de relación y prioridad comercial.</p></div>
      </div>
      <div className="conversation-list">
        {data.conversations.map((conversation) => <ConversationPreview key={conversation.id} conversation={conversation} detailed />)}
      </div>
    </section>
  );
}

function ConversationPreview({ conversation, detailed = false }: { conversation: DashboardData["conversations"][number]; detailed?: boolean }) {
  const lastMessage = conversation.messages.at(-1);
  const name = conversation.contact?.company || conversation.contact?.full_name || "Contacto Instagram";
  const tag = conversation.classification ? classificationLabel[conversation.classification] ?? conversation.classification : "Sin clasificar";

  return (
    <article>
      <div className="avatar large">{initials(name)}</div>
      <div className="conversation-body">
        <div><strong>{name}</strong><span className="tag">{tag}</span><small>{formatDate(conversation.last_message_at)}</small></div>
        <p>{conversation.summary || lastMessage?.body || "Sin resumen disponible"}</p>
        {detailed && lastMessage ? (
          <div className="draft">
            <span>ÚLTIMO MENSAJE · {lastMessage.direction === "inbound" ? "RECIBIDO" : "ENVIADO"}</span>
            <p>{lastMessage.body}</p>
          </div>
        ) : null}
        {conversation.suggested_reply ? (
          <div className="draft">
            <span>SIGUIENTE ACCIÓN RECOMENDADA</span>
            <p>{conversation.suggested_reply}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function Suppliers({ data }: { data: DashboardData }) {
  if (!data.suppliers.length) return <EmptyPanel eyebrow="RED DE SUMINISTRO" title="Todavía no hay proveedores" description="Aquí aparecerán únicamente proveedores reales registrados en Attempo." />;

  return (
    <section className="panel full-panel">
      <div className="section-intro"><div><span>RED DE SUMINISTRO</span><h2>Proveedores reales</h2><p>Condiciones conocidas y próximos pasos.</p></div></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Proveedor</th><th>MOQ</th><th>Gramaje</th><th>Material</th><th>Lead time</th><th>Estado</th><th>Siguiente acción</th></tr></thead>
          <tbody>
            {data.suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td><strong>{supplier.name}</strong><small>{supplier.country || "País pendiente"}</small></td>
                <td>{supplier.moq ?? "—"}</td>
                <td>{supplier.gsm_min && supplier.gsm_max ? `${supplier.gsm_min}-${supplier.gsm_max} GSM` : "—"}</td>
                <td>{supplier.materials?.join(", ") || "—"}</td>
                <td>{supplier.lead_time_min_days && supplier.lead_time_max_days ? `${supplier.lead_time_min_days}-${supplier.lead_time_max_days} días` : "—"}</td>
                <td><span className="status">{supplier.pipeline_status}</span></td>
                <td>{supplier.next_action || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Opportunities({ data }: { data: DashboardData }) {
  if (!data.opportunities.length) return <EmptyPanel eyebrow="PIPELINE COMERCIAL" title="Todavía no hay oportunidades formales" description="Las conversaciones ya están clasificadas; las oportunidades aparecerán cuando se conviertan en negociaciones comerciales con seguimiento propio." />;

  return (
    <section className="panel full-panel">
      <div className="section-intro"><div><span>PIPELINE COMERCIAL</span><h2>Oportunidades</h2></div></div>
      <div className="kanban">
        {data.opportunities.map((opportunity) => (
          <article key={opportunity.id}>
            <small>{opportunity.opportunity_type}</small>
            <strong>{opportunity.title}</strong>
            <p>{opportunity.next_action || "Sin siguiente acción"}</p>
            <div><span>{opportunity.stage}</span><span>{opportunity.probability ?? 0}%</span></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EmptyPanel({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="panel full-panel empty-dashboard">
      <div className="empty-mark">A</div>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}

function LoadingPanel() {
  return <EmptyPanel eyebrow="SINCRONIZANDO" title="Leyendo Supabase" description="Cargando proveedores, conversaciones y mensajes reales." />;
}

function ErrorPanel({ error }: { error: string }) {
  const detail = error.length > 220 ? `${error.slice(0, 220)}…` : error;
  return <EmptyPanel eyebrow="ERROR DE DATOS" title="No se pudo leer Supabase" description={`La API no ha podido completar la consulta. Detalle técnico: ${detail}`} />;
}

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "A";
}

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
