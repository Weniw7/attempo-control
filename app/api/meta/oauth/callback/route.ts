function htmlPage(title: string, message: string, status = 200) {
  const body = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} · Attempo</title>
    <style>
      body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f1e9;color:#1a1b17;font-family:Inter,system-ui,sans-serif}
      main{width:min(560px,calc(100% - 40px));padding:48px;background:#fbfaf6;border:1px solid #dfddd4;box-shadow:0 24px 70px #34352c14}
      span{display:block;font:italic 30px Georgia,serif;margin-bottom:28px}
      h1{font:500 36px Georgia,serif;margin:0 0 16px}
      p{color:#5e6057;line-height:1.7;margin:0}
    </style>
  </head>
  <body><main><span>A</span><h1>${title}</h1><p>${message}</p></main></body>
</html>`;

  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const code = url.searchParams.get("code");

  if (error) {
    return htmlPage(
      "No se pudo conectar Instagram",
      errorDescription ?? "Instagram ha cancelado o rechazado la autorización.",
      400,
    );
  }

  if (code) {
    return htmlPage(
      "Autorización recibida",
      "Instagram ha devuelto correctamente la autorización a Attempo. Ya puedes cerrar esta ventana.",
    );
  }

  return htmlPage(
    "Conexión de Instagram preparada",
    "Esta es la URL segura de redirección de Attempo para el inicio de sesión empresarial de Instagram.",
  );
}
