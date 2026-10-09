// service-worker.js — gerado pelo Mini SK em 09/10/2026, 14:39:30
// Não precisa mexer: ele guarda sozinho o que o app usa.
const PREFIXO = 'sk-artifacts-';
const CACHE = PREFIXO + 'mv192ogo';
// Lista feita automaticamente (para funcionar sem internet logo após instalar)
const GUARDAR = [
  "./",
  "./api-server/src/app.ts",
  "./api-server/src/index.ts",
  "./api-server/src/lib/logger.ts",
  "./api-server/src/routes/ai.ts",
  "./api-server/src/routes/health.ts",
  "./api-server/src/routes/index.ts",
  "./favicon.ico",
  "./icons/apple-touch-icon.png",
  "./icons/icon-16.png",
  "./icons/icon-32.png",
  "./icons/icon-48.png",
  "./icons/icon-72.png",
  "./icons/icon-96.png",
  "./icons/icon-128.png",
  "./icons/icon-144.png",
  "./icons/icon-152.png",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-384.png",
  "./icons/icon-512.png",
  "./icons/icon.svg",
  "./icons/maskable-192.png",
  "./icons/maskable-512.png",
  "./icons/maskable.svg",
  "./index.html",
  "./manifest.json",
  "./mobile/.easignore",
  "./mobile/.env",
  "./mobile/.env.example",
  "./mobile/.npmrc",
  "./mobile/.replit-artifact/artifact.toml",
  "./mobile/app.json",
  "./mobile/app/_layout.tsx",
  "./mobile/app/(tabs)/_layout.tsx",
  "./mobile/app/(tabs)/ai.tsx",
  "./mobile/app/(tabs)/browser.tsx",
  "./mobile/app/(tabs)/editor.tsx",
  "./mobile/app/(tabs)/index-modulos/_indice.md",
  "./mobile/app/(tabs)/index-modulos/01-imports.tsx",
  "./mobile/app/(tabs)/index-modulos/02-templates.tsx",
  "./mobile/app/(tabs)/index-modulos/03-avatar-colors.tsx",
  "./mobile/app/(tabs)/index-modulos/04-getavatarcolor.tsx",
  "./mobile/app/(tabs)/index-modulos/05-getinitials.tsx",
  "./mobile/app/(tabs)/index-modulos/06-openineditor.tsx",
  "./mobile/app/(tabs)/index-modulos/07-projectcard.tsx",
  "./mobile/app/(tabs)/index-modulos/08-projectsscreen.tsx",
  "./mobile/app/(tabs)/index-modulos/09-styles.tsx",
  "./mobile/app/(tabs)/index.tsx",
  "./mobile/app/(tabs)/plugins.tsx",
  "./mobile/app/(tabs)/pwa.tsx",
  "./mobile/app/(tabs)/settings.tsx",
  "./mobile/app/(tabs)/tasks.tsx",
  "./mobile/app/(tabs)/terminal.tsx",
  "./mobile/app/+not-found.tsx",
  "./mobile/assets/images/icon.png",
  "./mobile/babel.config.js",
  "./mobile/capacitor.config.ts",
  "./mobile/COMO_BUILDAR.md",
  "./mobile/COMO-BUILDAR-APK.md",
  "./mobile/components/AIChat.tsx",
  "./mobile/components/AIMemoryModal.tsx",
  "./mobile/components/APKBuilderModal.tsx",
  "./mobile/components/CampoLivreModal.tsx",
  "./mobile/components/CheckpointsModal.tsx",
  "./mobile/components/CodeEditor.tsx",
  "./mobile/components/CombinarAppsModal.tsx",
  "./mobile/components/DatabasePanel.tsx",
  "./mobile/components/ErrorBoundary.tsx",
  "./mobile/components/ErrorFallback.tsx",
  "./mobile/components/FileSidebar.tsx",
  "./mobile/components/FloatingAI.tsx",
  "./mobile/components/GitHubModal.tsx",
  "./mobile/components/HtmlPlayground.tsx",
  "./mobile/components/KeyboardAwareScrollViewCompat.tsx",
  "./mobile/components/LibrarySearch.tsx",
  "./mobile/components/ManualModal.tsx",
  "./mobile/components/MessageRenderer.tsx",
  "./mobile/components/MonacoEditor.tsx",
  "./mobile/components/PreviewPanel.tsx",
  "./mobile/components/ProjectOverviewModal.tsx",
  "./mobile/components/ProjectPlanModal.tsx",
  "./mobile/components/SiteExtractor.tsx",
  "./mobile/components/SystemStatus.tsx",
  "./mobile/components/Terminal.tsx",
  "./mobile/components/VoiceAssistant.tsx",
  "./mobile/components/VSCodeView.tsx",
  "./mobile/components/VSCodeWebModal.tsx",
  "./mobile/components/XTermWebView.tsx",
  "./mobile/constants/colors.ts",
  "./mobile/context/AppContext.tsx",
  "./mobile/data/featuredProjects.ts",
  "./mobile/eas.json",
  "./mobile/expo-env.d.ts",
  "./mobile/GERAR-APK.md",
  "./mobile/hooks/useApiBase.ts",
  "./mobile/hooks/useColors.ts",
  "./mobile/MANUAL-COMPLETO.md",
  "./mobile/metro.config.js",
  "./mobile/package.json",
  "./mobile/PLANO.md",
  "./mobile/plugins/withTermuxIntent.js",
  "./mobile/scripts/build.js",
  "./mobile/server/serve.js",
  "./mobile/server/templates/favicon.ico",
  "./mobile/server/templates/icons/apple-touch-icon.png",
  "./mobile/server/templates/icons/icon-16.png",
  "./mobile/server/templates/icons/icon-32.png",
  "./mobile/server/templates/icons/icon-48.png",
  "./mobile/server/templates/icons/icon-72.png",
  "./mobile/server/templates/icons/icon-96.png",
  "./mobile/server/templates/icons/icon-128.png",
  "./mobile/server/templates/icons/icon-144.png",
  "./mobile/server/templates/icons/icon-152.png",
  "./mobile/server/templates/icons/icon-180.png",
  "./mobile/server/templates/icons/icon-192.png",
  "./mobile/server/templates/icons/icon-384.png",
  "./mobile/server/templates/icons/icon-512.png",
  "./mobile/server/templates/icons/icon.svg",
  "./mobile/server/templates/icons/maskable-192.png",
  "./mobile/server/templates/icons/maskable-512.png",
  "./mobile/server/templates/icons/maskable.svg",
  "./mobile/server/templates/landing-page.html",
  "./mobile/server/templates/landing-page.webmanifest",
  "./mobile/server/templates/service-worker.js",
  "./mobile/services/apiBase.ts",
  "./mobile/services/githubService.ts",
  "./mobile/services/localSQLite.ts",
  "./mobile/services/previewService.ts",
  "./mobile/services/runtimeMode.ts",
  "./mobile/services/storageService.ts",
  "./mobile/services/terminalService.ts",
  "./mobile/tsconfig.json",
  "./mobile/utils/projectPlan.ts",
  "./mobile/utils/zipUtils.ts"
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(GUARDAR.map((u) => c.add(u).catch(() => null)))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k.startsWith(PREFIXO) && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Primeiro a internet (sempre a versão nova); sem internet, a cópia guardada.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
      // Igual ao Workbox da Replit: página que não existe (rota do app) abre o index
      if (res.status === 404 && req.mode === 'navigate') return caches.match('./').then((r) => r || fetch('./'));
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || (req.mode === 'navigate' ? caches.match('./') : undefined)))
  );
});
