import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Eliminación de datos | Attempo",
  description: "Instrucciones para solicitar la eliminación de datos de Attempo CRM.",
};

export default function DataDeletionPage() {
  return (
    <main className="legal-page">
      <article className="legal-card compact">
        <header className="legal-header">
          <Link href="/" className="legal-brand" aria-label="Volver a Attempo Control">
            <span>A</span><strong>ATTEMPO</strong>
          </Link>
          <p>Privacidad y control de datos</p>
          <h1>Eliminación de datos</h1>
          <p className="legal-lead">
            Puede solicitar que eliminemos la información asociada a sus
            conversaciones con Attempo en Instagram.
          </p>
        </header>
        <section>
          <h2>Cómo solicitarla</h2>
          <ol>
            <li>
              Contacte con Attempo mediante los canales oficiales publicados en{" "}
              <a href="https://www.attempo.es">www.attempo.es</a> o desde la misma
              cuenta de Instagram con la que inició la conversación.
            </li>
            <li>Indique que solicita la eliminación de datos de Attempo CRM e incluya su nombre de usuario de Instagram.</li>
            <li>Podremos pedir una comprobación razonable para evitar que otra persona elimine sus datos sin autorización.</li>
          </ol>
        </section>
        <section>
          <h2>Qué eliminaremos</h2>
          <p>
            Eliminaremos los mensajes almacenados en Attempo CRM, los datos de
            contacto asociados y los análisis derivados que permitan identificarle,
            salvo aquella información que deba conservarse temporalmente por una obligación legal.
          </p>
        </section>
        <section>
          <h2>Plazo</h2>
          <p>
            La solicitud se atenderá sin dilación indebida y, como máximo, dentro
            del plazo previsto por la normativa aplicable. Le confirmaremos cuando el proceso haya finalizado.
          </p>
        </section>
        <footer className="legal-footer">
          <Link href="/privacy">Política de privacidad</Link>
          <Link href="/">Attempo Control</Link>
        </footer>
      </article>
    </main>
  );
}
