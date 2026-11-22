export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Cette page n'a pas pu se charger</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #0f1115; color: #f4f4f5; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2.5rem; background: #181a20; border-radius: 1rem; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
      h1 { font-size: 1.35rem; margin: 0 0 0.5rem; color: #f59e0b; }
      p { color: #a1a1aa; margin: 0 0 1.75rem; font-size: 0.95rem; }
      .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.6rem 1.2rem; border-radius: 0.5rem; font: inherit; font-weight: 500; cursor: pointer; text-decoration: none; border: 1px solid transparent; transition: all 0.2s; }
      .primary { background: #d97706; color: #fff; }
      .primary:hover { background: #b45309; }
      .secondary { background: #27272a; color: #f4f4f5; border-color: rgba(255,255,255,0.1); }
      .secondary:hover { background: #3f3f46; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>BarberCraft</h1>
      <p>Une erreur inattendue est survenue lors du chargement. Veuillez rafraîchir ou revenir à l'accueil.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Réessayer</button>
        <a class="secondary" href="/">Accueil</a>
      </div>
    </div>
  </body>
</html>`;
}
