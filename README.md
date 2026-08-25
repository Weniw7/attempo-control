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

Configura estas variables en Cloudflare antes de desplegar:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Usa únicamente la clave publicable de Supabase en el frontend. Nunca añadas la clave secreta o `service_role` al repositorio.

## Stack

- React / Vinext
- Cloudflare Workers
- Supabase
- TypeScript
