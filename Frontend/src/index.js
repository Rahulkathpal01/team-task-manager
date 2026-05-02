/* Import distinctive fonts */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=DM+Sans:wght@300;400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  *, *::before, *::after { box-sizing: border-box; }

  html { -webkit-font-smoothing: antialiased; }

  body {
    @apply bg-canvas text-text font-sans;
    min-height: 100vh;
  }

  /* Scrollbar — themed to match */
  ::-webkit-scrollbar       { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { @apply bg-surface; }
  ::-webkit-scrollbar-thumb { @apply bg-muted rounded-full; }
  ::-webkit-scrollbar-thumb:hover { @apply bg-dim; }
}

@layer components {
  /* Reusable input style */
  .field {
    @apply w-full bg-surface border border-border rounded
           px-3 py-2.5 text-sm text-text placeholder-dim
           focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber
           transition-colors duration-150;
  }

  /* Primary CTA button */
  .btn-primary {
    @apply bg-amber text-canvas font-mono text-sm font-bold
           px-4 py-2.5 rounded
           hover:bg-amber-glow active:scale-[0.98]
           transition-all duration-150
           disabled:opacity-40 disabled:cursor-not-allowed;
  }

  /* Ghost / secondary button */
  .btn-ghost {
    @apply border border-border text-dim font-mono text-sm
           px-4 py-2.5 rounded
           hover:border-amber hover:text-amber
           transition-all duration-150;
  }

  /* Card surface */
  .card {
    @apply bg-surface border border-border rounded-lg;
  }

  /* Status pill badges */
  .badge-pending     { @apply bg-muted/40     text-dim     text-xs font-mono px-2 py-0.5 rounded; }
  .badge-in_progress { @apply bg-amber-dim/40 text-amber   text-xs font-mono px-2 py-0.5 rounded; }
  .badge-completed   { @apply bg-success/10   text-success text-xs font-mono px-2 py-0.5 rounded; }
  .badge-overdue     { @apply bg-danger/10    text-danger  text-xs font-mono px-2 py-0.5 rounded; }
}