# Attempo Control

CRM interno de Attempo para gestionar rentabilidad, proveedores, conversaciones, oportunidades, eventos y costes.

## Desarrollo local

```bash
npm ci
npm run dev
```

## Cloudflare Workers

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`
- Production branch: `main`
- Instagram webhook: `/api/meta/webhook`

Configura estas variables en Cloudflare antes de desplegar:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `META_APP_SECRET`
- `META_WEBHOOK_VERIFY_TOKEN`

Las claves privadas deben configurarse como secretos de Cloudflare y nunca guardarse en el repositorio.

Último despliegue forzado: 26 de agosto de 2026.

## Stack

- React / Vinext
- Cloudflare Workers
- Supabase
- TypeScript
