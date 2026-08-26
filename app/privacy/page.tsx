import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de privacidad | Attempo",
  description: "Información sobre el tratamiento de datos en Attempo CRM.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <article className="legal-card">
        <header className="legal-header">
          <Link href="/" className="legal-brand" aria-label="Volver a Attempo Control">
            <span>A</span><strong>ATTEMPO</strong>
          </Link>
          <p>Última actualización: 26 de agosto de 2026</p>
          <h1>Política de privacidad</h1>
          <p className="legal-lead">
            Esta política explica cómo Attempo trata la información utilizada por
            Attempo CRM y por su integración oficial con Instagram.
          </p>
        </header>

        <section>
          <h2>1. Responsable del tratamiento</h2>
          <p>
            El responsable es Attempo, marca responsable de Attempo CRM. Para
            consultas sobre privacidad o ejercicio de derechos puede utilizar los
            canales de contacto publicados en{" "}
            <a href="https://www.attempo.es">www.attempo.es</a>.
          </p>
        </section>
        <section>
          <h2>2. Datos tratados</h2>
          <p>La integración puede tratar los siguientes datos:</p>
          <ul>
            <li>Identificador y nombre de usuario de Instagram.</li>
            <li>Mensajes, respuestas, comentarios y contenido enviado a Attempo.</li>
            <li>Fecha, hora e identificadores técnicos de la conversación.</li>
            <li>Información comercial facilitada en los mensajes, como precios, cantidades mínimas, materiales, plazos o propuestas de colaboración.</li>
          </ul>
          <p>Attempo no solicita mediante esta integración contraseñas de Instagram ni datos de pago.</p>
        </section>
        <section>
          <h2>3. Finalidad</h2>
          <ul>
            <li>Gestionar y organizar las conversaciones recibidas por Attempo.</li>
            <li>Identificar proveedores, oportunidades, eventos y colaboraciones.</li>
            <li>Extraer y estructurar información comercial relevante para el CRM.</li>
            <li>Preparar borradores de respuesta para su revisión y aprobación por el equipo de Attempo.</li>
            <li>Atender solicitudes y mantener la relación comercial.</li>
          </ul>
        </section>
        <section>
          <h2>4. Base jurídica</h2>
          <p>
            El tratamiento se basa, según el caso, en la gestión de medidas
            precontractuales o contractuales, el consentimiento del interesado y
            el interés legítimo de Attempo en administrar sus comunicaciones y
            relaciones comerciales.
          </p>
        </section>
        <section>
          <h2>5. Proveedores y destinatarios</h2>
          <p>
            Para prestar el servicio pueden intervenir Meta Platforms
            (Instagram), Cloudflare como infraestructura de la aplicación y
            Supabase como plataforma de base de datos. Si se activa el análisis
            automatizado, podrán intervenir proveedores de inteligencia artificial
            bajo instrucciones de Attempo y con acceso limitado a la finalidad
            descrita.
          </p>
          <p>Attempo no vende los datos personales ni los utiliza para publicidad ajena a la relación mantenida con la marca.</p>
        </section>
        <section>
          <h2>6. Conservación y seguridad</h2>
          <p>
            La información se conserva mientras sea necesaria para gestionar la
            conversación, la oportunidad o la relación comercial y, posteriormente,
            durante los plazos exigidos por la normativa aplicable. Se aplican
            controles de acceso, cifrado en tránsito y credenciales privadas de servidor.
          </p>
        </section>
        <section>
          <h2>7. Transferencias internacionales</h2>
          <p>
            Algunos proveedores tecnológicos pueden tratar datos fuera del Espacio
            Económico Europeo. Cuando corresponda, se emplearán mecanismos
            reconocidos por la normativa, como decisiones de adecuación o cláusulas contractuales tipo.
          </p>
        </section>
        <section>
          <h2>8. Derechos</h2>
          <p>
            Puede solicitar acceso, rectificación, supresión, oposición, limitación
            o portabilidad mediante los canales de contacto de Attempo. También
            puede presentar una reclamación ante la Agencia Española de Protección de Datos.
          </p>
          <p>Consulte las <Link href="/data-deletion">instrucciones para eliminar sus datos</Link>.</p>
        </section>
        <section>
          <h2>9. Cambios en esta política</h2>
          <p>
            Attempo podrá actualizar esta política para reflejar cambios legales o
            técnicos. La fecha de la versión vigente se muestra al inicio.
          </p>
        </section>
        <footer className="legal-footer">
          <Link href="/">Attempo Control</Link>
          <Link href="/data-deletion">Eliminación de datos</Link>
          <a href="https://www.attempo.es">attempo.es</a>
        </footer>
      </article>
    </main>
  );
}
