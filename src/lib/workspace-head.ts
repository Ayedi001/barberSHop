export function workspaceHead(title: string) {
  const description = `${title} : espace privé de gestion et de réservation BarberCraft.`;
  return {
    meta: [
      { title: `${title} — BarberCraft` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — BarberCraft` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  };
}
