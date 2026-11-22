# Instructions pour les Agents BarberCraft

- Les photographies de barbiers, coupes et salons sont gérées dans `src/lib/barber-images.ts` et `src/lib/demo-barbers.ts`. Utilisez-les comme fallbacks élégants lorsque la base Supabase est vide.
- Réutilisez le composant `PhotoGallery` pour l'agrandissement accessible et la navigation modale au lieu de dupliquer l'état lightbox.
- Les routes privées authentifiées utilisent `workspaceHead` avec des titres uniques et `noindex` pour préserver la vie privée des données de rendez-vous et de caisse.
- Pour les tests et démonstrations, le bouton "Charger des données de démo" sur le tableau de bord barbier exécute la fonction SQL `seed_my_barber_demo_data`.
- Veillez à maintenir le typage strict TypeScript sans avertissement ni régression (`npm test` et `npx tsc --noEmit`).
