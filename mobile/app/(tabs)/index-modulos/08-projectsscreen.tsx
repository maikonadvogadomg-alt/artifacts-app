export default function ProjectsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const apiBase = useApiBase();
  const {
    projects,
    createProject,
    deleteProject,
    updateProject,
    setActiveProject,
    combineProjects,
    importGitRepo,
    pushToGit,
    gitConfigs,
    createFile,
    createFiles,
    activeProject,
    activeTerminal,
    settings,
  } = useApp();

  const [showNewModal, setShowNewModal] = useState(false);
  const [showGitModal, setShowGitModal] = useState(false);
  const [showCombineModal, setShowCombineModal] = useState(false);
  const [showLibSearch, setShowLibSearch] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showSiteExtractor, setShowSiteExtractor] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Novo: abas + pesquisa + modo + Criar com IA
  const [activeTab, setActiveTab] = useState<"tudo" | "recente" | "criar">("criar");
  const [searchText, setSearchText] = useState("");
  const [showCriarComIA, setShowCriarComIA] = useState(false);
  const [iaDesc, setIaDesc] = useState("");
  const [iaProjectName, setIaProjectName] = useState("");
  const [iaGenerating, setIaGenerating] = useState(false);

  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [template, setTemplate] = useState("vazio");

  const [gitUrl, setGitUrl] = useState("");
  const [gitToken, setGitToken] = useState("");
  const [gitProvider, setGitProvider] = useState<"github" | "gitlab">("github");

  const [combineName, setCombineName] = useState("");
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ pct: number; phase: string } | null>(null);

  const [showApkModal, setShowApkModal] = useState(false);
  const [featuredImporting, setFeaturedImporting] = useState<string | null>(null);
  const [apkProject, setApkProject] = useState<Project | null>(null);
  const [folderFilter, setFolderFilter] = useState<string | null>(null);
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [folderPickerTarget, setFolderPickerTarget] = useState<Project | null>(null);
  const DEFAULT_FOLDERS = ["APK/Android", "Web/PWA", "Estudo", "Trabalho", "Testes"];
  const [showPushModal, setShowPushModal] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [pwaUrl, setPwaUrl] = useState("");
  const [pushProject, setPushProject] = useState<Project | null>(null);
  const [pushRepoUrl, setPushRepoUrl] = useState("");
  const [pushToken, setPushToken] = useState("");
  const [pushBranch, setPushBranch] = useState("main");
  const [pushing, setPushing] = useState(false);
  const [pushUserRepos, setPushUserRepos] = useState<{ id: number; name: string; private: boolean; owner: { login: string } }[]>([]);
  const [pushLoadingRepos, setPushLoadingRepos] = useState(false);
  const [pushSelectedRepo, setPushSelectedRepo] = useState<{ name: string; owner: string } | null>(null);
  const [pushCreateNew, setPushCreateNew] = useState(false);
  const [pushNewRepoName, setPushNewRepoName] = useState("");
  const [pushGhLogin, setPushGhLogin] = useState("");
  const [importUserRepos, setImportUserRepos] = useState<{ id: number; name: string; private: boolean; owner: { login: string }; default_branch: string }[]>([]);
  const [importLoadingRepos, setImportLoadingRepos] = useState(false);
  const [importShowUrl, setImportShowUrl] = useState(false);

  const topPadding = Platform.OS === "web" ? 14 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 70 : Math.max(insets.bottom, 16) + 70;

  const handleAddFeaturedProject = (fp: typeof FEATURED_PROJECTS[0]) => {
    const already = projects.find(p => p.name === fp.name);
    if (already) {
      Alert.alert(
        "Projeto já existe",
        `"${fp.name}" já está na sua lista. Quer abrir ele?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Abrir", onPress: () => { setActiveProject(already); router.navigate("/(tabs)/editor"); } },
        ]
      );
      return;
    }
    setFeaturedImporting(fp.id);
    const proj = createProject(fp.name, fp.description);
    createFiles(proj.id, fp.files.map(f => ({ path: f.path, content: f.content })));
    setActiveProject(proj);
    setFeaturedImporting(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "✅ Projeto adicionado!",
      `"${fp.name}" adicionado com ${fp.files.length} arquivos prontos.\n\nAbrir no editor agora?`,
      [
        { text: "Agora não", style: "cancel" },
        { text: "Abrir Editor", onPress: () => router.navigate("/(tabs)/editor") },
      ]
    );
  };

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    router.navigate("/(tabs)/editor");
  };

  const handleExportZip = async (project: Project) => {
    const ok = await exportZip(project);
    if (!ok) Alert.alert("Erro", "Não foi possível exportar o projeto.");
  };

  const handleSendToTerminal = async (project: Project) => {
    if (!apiBase) {
      Alert.alert(
        "Servidor offline",
        "O terminal do servidor não está disponível agora.\n\nUse 'Exportar ZIP' para levar os arquivos para outro local, ou configure o Termux no celular.",
        [{ text: "Exportar ZIP", onPress: () => handleExportZip(project) }, { text: "Cancelar", style: "cancel" }]
      );
      return;
    }
    setActiveProject(project);
    const sessionId = activeTerminal || "project-sync";
    try {
      const res = await fetch(`${apiBase}/api/terminal/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          files: project.files
            .filter((f) => !f.path?.endsWith(".gitkeep"))
            .map((f) => ({ path: f.path || f.name, content: f.content || "" })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "📡 Projeto no Terminal!",
        `"${project.name}" — ${data.count} arquivo(s) enviados.\n📁 Diretório: ${data.cwd}\n\nAbrindo terminal...`,
        [{ text: "Ir ao Terminal", onPress: () => router.navigate("/(tabs)/terminal") }]
      );
    } catch (e: any) {
      Alert.alert("Erro ao enviar", e?.message || "Falha ao conectar com o servidor.");
    }
  };

  const handleSyncFromTerminal = async (project: Project) => {
    if (!apiBase) {
      Alert.alert(
        "Servidor offline",
        "Sem servidor, use 'Importar ZIP' para receber arquivos.",
        [{ text: "Importar ZIP", onPress: handleImportZip }, { text: "Cancelar", style: "cancel" }]
      );
      return;
    }
    setActiveProject(project);
    const sessionId = activeTerminal || "project-sync";
    try {
      const res = await fetch(`${apiBase}/api/terminal/read?sessionId=${encodeURIComponent(sessionId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { ok: boolean; cwd: string; files: Array<{ path: string; content: string }> } = await res.json();
      if (!data.files?.length) {
        Alert.alert(
          "Sem arquivos no terminal",
          "Nenhum arquivo encontrado no servidor.\n\nPrimeiro use '📡 Terminal' para enviar o projeto, edite no terminal, depois sincronize.",
          [{ text: "OK" }]
        );
        return;
      }
      createFiles(project.id, data.files);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("↩ Sincronizado!", `${data.files.length} arquivo(s) recebidos do terminal → "${project.name}".`);
    } catch (e: any) {
      Alert.alert("Erro ao sincronizar", e?.message || "Falha ao conectar com o servidor.");
    }
  };

  const handleImportZip = async () => {
    setShowActionsMenu(false);
    setImportProgress({ pct: 0, phase: "Aguardando seleção..." });
    try {
      const data = await importZip((cur, _total, phase) => {
        setImportProgress({ pct: cur, phase });
      });
      if (!data) { setImportProgress(null); return; }
      setImportProgress({ pct: 98, phase: `Salvando ${data.files.length.toLocaleString("pt-BR")} arquivos...` });
      const proj = createProject(data.name, data.description);
      const filesInput = data.files.map((f) => ({ path: f.path || f.name, content: f.content }));
      const createdFiles = createFiles(proj.id, filesInput);
      setActiveProject({ ...proj, files: createdFiles });
      setImportProgress(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("✅ Importado!", `"${data.name}" — ${data.files.length.toLocaleString("pt-BR")} arquivo(s) importados.`);
    } catch (err: any) {
      setImportProgress(null);
      Alert.alert("Erro ao importar ZIP", err?.message || String(err) || "Falha desconhecida ao ler o arquivo.");
    }
  };

  const handleImportTar = async () => {
    setShowActionsMenu(false);
    setImportProgress({ pct: 0, phase: "Aguardando seleção..." });
    try {
      const data = await importTar((cur, _total, phase) => {
        setImportProgress({ pct: cur, phase });
      });
      if (!data) { setImportProgress(null); return; }
      setImportProgress({ pct: 98, phase: `Salvando ${data.files.length.toLocaleString("pt-BR")} arquivos...` });
      const proj = createProject(data.name, data.description);
      const filesInput = data.files.map((f) => ({ path: f.path || f.name, content: f.content }));
      const createdFiles = createFiles(proj.id, filesInput);
      setActiveProject({ ...proj, files: createdFiles });
      setImportProgress(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("✅ Importado!", `"${data.name}" — ${data.files.length.toLocaleString("pt-BR")} arquivo(s) importados.`);
    } catch (err: any) {
      setImportProgress(null);
      Alert.alert("Erro ao importar TAR", err?.message || String(err));
    }
  };

  const handleCreateProject = () => {
    const autoName = newName.trim() || `Projeto ${projects.length + 1}`;
    const tmpl = TEMPLATES[template];
    const proj = createProject(autoName, newDesc.trim());
    const createdFiles = createFiles(proj.id, tmpl.files.map((f) => ({ path: f.name, content: f.content })));
    setActiveProject({ ...proj, files: createdFiles });
    setShowNewModal(false);
    setNewName("");
    setNewDesc("");
    setTemplate("vazio");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.navigate("/(tabs)/editor");
  };

  const handleLoadPushRepos = async (token: string) => {
    if (!token.trim() || token.trim().length < 10) return;
    setPushLoadingRepos(true);
    try {
      const user = await getUser(token.trim());
      setPushGhLogin(user.login);
      const repoList = await listRepos(token.trim());
      setPushUserRepos(repoList as { id: number; name: string; private: boolean; owner: { login: string } }[]);
    } catch {}
    setPushLoadingRepos(false);
  };

  const openImportGitModal = () => {
    setGitToken("");
    setGitUrl("");
    setImportUserRepos([]);
    setImportShowUrl(false);
    const savedToken = gitConfigs.find((g) => g.provider === "github")?.token || "";
    if (savedToken) handleLoadImportRepos(savedToken);
    setShowGitModal(true);
  };

  const handleLoadImportRepos = async (token: string) => {
    if (!token.trim() || token.trim().length < 10) return;
    setImportLoadingRepos(true);
    try {
      const repoList = await listRepos(token.trim());
      setImportUserRepos(repoList as { id: number; name: string; private: boolean; owner: { login: string }; default_branch: string }[]);
    } catch {}
    setImportLoadingRepos(false);
  };

  const handleImportGit = async (urlOverride?: string) => {
    const token = gitToken || gitConfigs.find((g) => g.provider === gitProvider)?.token || "";
    const url = urlOverride || gitUrl.trim();
    if (!url) return;
    setImporting(true);
    setImportProgress({ pct: 0, phase: "Conectando ao repositório..." });
    try {
      const proj = await importGitRepo(url, token, gitProvider, (cur, _total, phase) => {
        setImportProgress({ pct: cur, phase });
      });
      setImportProgress(null);
      setActiveProject(proj);
      setShowGitModal(false);
      setGitUrl("");
      setGitToken("");
      setImportUserRepos([]);
      setImportShowUrl(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("✅ Importado!", `${proj.files.length.toLocaleString("pt-BR")} arquivo(s) importados de "${proj.name}".`);
      router.navigate("/(tabs)/editor");
    } catch (e: any) {
      setImportProgress(null);
      Alert.alert("Erro", e?.message || "Não foi possível importar o repositório.");
    } finally {
      setImporting(false);
    }
  };

  const [pushProgress, setPushProgress] = useState({ cur: 0, total: 0, phase: "" });

  const handlePushToGit = async () => {
    const token = pushToken.trim() || gitConfigs.find((g) => g.provider === "github")?.token || "";
    if (!pushProject || !token) return;
    let repoUrl = "";
    if (pushCreateNew && pushNewRepoName.trim()) {
      try {
        const newRepo = await createRepo(token, pushNewRepoName.trim(), "", false);
        repoUrl = newRepo.html_url;
      } catch (e: unknown) {
        Alert.alert("Erro ao criar repositório", e instanceof Error ? e.message : "Não foi possível criar o repositório.");
        return;
      }
    } else if (pushSelectedRepo) {
      repoUrl = `https://github.com/${pushSelectedRepo.owner}/${pushSelectedRepo.name}`;
    } else if (pushRepoUrl.trim()) {
      repoUrl = pushRepoUrl.trim();
    } else {
      Alert.alert("Atenção", "Selecione um repositório ou crie um novo.");
      return;
    }
    setPushing(true);
    setPushProgress({ cur: 0, total: pushProject.files?.length || 0, phase: "Iniciando..." });
    try {
      const result = await pushToGit(
        pushProject.id,
        repoUrl,
        token,
        pushBranch.trim() || "main",
        (cur, total, phase) => setPushProgress({ cur, total, phase })
      );
      setShowPushModal(false);
      setPushRepoUrl("");
      setPushToken("");
      setPushBranch("main");
      setPushProgress({ cur: 0, total: 0, phase: "" });
      setPushSelectedRepo(null);
      setPushCreateNew(false);
      setPushNewRepoName("");
      setPushUserRepos([]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "✅ Enviado!",
        `${result.pushed} arquivo(s) enviado(s) com sucesso!${result.errors > 0 ? `\n⚠️ ${result.errors} arquivo(s) com erro.` : ""}\n\nAbra o repositório no GitHub para confirmar.`
      );
    } catch (e: unknown) {
      Alert.alert("Erro ao enviar", e instanceof Error ? e.message : "Não foi possível enviar para o repositório.");
    } finally {
      setPushing(false);
    }
  };

  const handleCombine = () => {
    if (selectedProjects.length < 2 || !combineName.trim()) return;
    const combined = combineProjects(selectedProjects, combineName.trim());
    setActiveProject(combined);
    setSelectedProjects([]);
    setCombineName("");
    setShowCombineModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.navigate("/(tabs)/editor");
  };

  const handleRename = () => {
    if (!renameTarget || !renameValue.trim()) return;
    updateProject(renameTarget.id, { name: renameValue.trim() });
    if (activeProject?.id === renameTarget.id) {
      setActiveProject({ ...activeProject, name: renameValue.trim() });
    }
    setRenameTarget(null);
    setRenameValue("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCriarComIA = async () => {
    if (!iaDesc.trim()) return;
    setIaGenerating(true);
    const nomeProjeto = iaProjectName.trim() || `Projeto IA ${projects.length + 1}`;
    try {
      const aiApiBase = apiBase ? `${apiBase}/api` : "http://localhost:8080/api";
      const response = await fetch(`${aiApiBase}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Crie um projeto completo chamado "${nomeProjeto}" com a seguinte descrição:\n\n${iaDesc}\n\nResponda APENAS com um JSON no formato:\n{\n  "files": [\n    {"name": "index.js", "content": "...código completo..."},\n    {"name": "package.json", "content": "..."},\n    {"name": "README.md", "content": "..."}\n  ]\n}\n\nIncluir pelo menos 3-5 arquivos funcionais. Não coloque nada fora do JSON.`,
            },
          ],
          model: "gemini-2.5-flash",
        }),
      });

      let fullText = "";
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.content) fullText += d.content;
            } catch {}
          }
        }
      }

      // Extrai o JSON da resposta
      const match = fullText.match(/\{[\s\S]*"files"[\s\S]*\}/);
      if (!match) throw new Error("IA não retornou JSON válido");
      const parsed = JSON.parse(match[0]);
      const filesData = parsed.files as Array<{ name: string; content: string }>;

      const proj = createProject(nomeProjeto, iaDesc.trim().slice(0, 100));
      const createdFiles = createFiles(proj.id, filesData.map((f) => ({ path: f.name, content: f.content })));
      setActiveProject({ ...proj, files: createdFiles });
      setShowCriarComIA(false);
      setIaDesc("");
      setIaProjectName("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("✅ Projeto criado!", `"${nomeProjeto}" criado com ${filesData.length} arquivo(s) pela IA!`, [
        { text: "Abrir no Editor", onPress: () => router.navigate("/(tabs)/editor") },
        { text: "Ver depois", style: "cancel" },
      ]);
    } catch (e: unknown) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Erro ao gerar projeto com IA.");
    } finally {
      setIaGenerating(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Filtrar projetos por aba e busca
  const filteredProjects = (() => {
    let list = [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    if (activeTab === "recente") list = list.slice(0, 5);
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (folderFilter !== null) {
      list = list.filter((p) => (p.folder || null) === folderFilter);
    }
    return list;
  })();

  const allFolders = Array.from(new Set(projects.map((p) => p.folder).filter(Boolean))) as string[];

  const groupedProjects = (() => {
    if (folderFilter !== null || searchText.trim() || activeTab !== "tudo") return null;
    const groups: Record<string, Project[]> = {};
    const noFolder: Project[] = [];
    for (const p of filteredProjects) {
      if (p.folder) {
        groups[p.folder] = groups[p.folder] || [];
        groups[p.folder].push(p);
      } else {
        noFolder.push(p);
      }
    }
    return { groups, noFolder };
  })();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── HEADER SK CODE EDITOR ── */}
      <View style={[styles.skHeader, { paddingTop: topPadding + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {/* Logo + título */}
        <View style={styles.skHeaderLeft}>
          <View style={styles.skLogo}>
            <Text style={styles.skLogoText}>{"</>"}</Text>
          </View>
          <View>
            <Text style={[styles.skTitle, { color: colors.foreground }]}>DevMobile</Text>
            <Text style={[styles.skSubtitle, { color: colors.mutedForeground }]}>IDE no Celular</Text>
          </View>
        </View>

        {/* Botões direita */}
        <View style={styles.skHeaderRight}>
          {selectedProjects.length >= 2 && (
            <TouchableOpacity onPress={() => setShowCombineModal(true)} style={[styles.skBtn, { backgroundColor: "#7c3aed" }]}>
              <Feather name="layers" size={14} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setShowActionsMenu(true)}
            style={[styles.skBtn, { backgroundColor: colors.secondary, borderColor: colors.border, borderWidth: 1 }]}
          >
            <Feather name="more-horizontal" size={15} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowNewModal(true)}
            style={[styles.skBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="plus" size={16} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── BARRA DE PESQUISA ── */}
      <View style={[styles.skSearchBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.skSearchInput, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="search" size={14} color={colors.mutedForeground} />
          <TextInput
            style={[styles.skSearchText, { color: colors.foreground }]}
            placeholder="Pesquisar projetos..."
            placeholderTextColor={colors.mutedForeground}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Feather name="x" size={13} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── ABAS: TUDO / RECENTE / CRIAR ── */}
      <View style={[styles.skTabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(["tudo", "recente", "criar"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.skTab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.skTabText, { color: activeTab === tab ? colors.primary : colors.mutedForeground }]}>
              {tab === "tudo" ? "TUDO" : tab === "recente" ? "RECENTE" : "CRIAR"}
            </Text>
            {tab === "tudo" && projects.length > 0 && (
              <View style={[styles.skTabBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.skTabBadgeText}>{projects.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── BARRA DE PASTAS ── */}
      {activeTab === "tudo" && (projects.length > 0 || allFolders.length > 0) && (
        <View style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          {/* Chips de filtro */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: folderFilter ? 4 : 8, gap: 6, flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => setFolderFilter(null)}
              style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: folderFilter === null ? colors.primary : "transparent", borderWidth: 1, borderColor: folderFilter === null ? colors.primary : colors.border }}
            >
              <Feather name="layers" size={10} color={folderFilter === null ? colors.primaryForeground : colors.mutedForeground} />
              <Text style={{ color: folderFilter === null ? colors.primaryForeground : colors.mutedForeground, fontSize: 11, fontWeight: "700" }}>
                Tudo ({projects.length})
              </Text>
            </TouchableOpacity>
            {allFolders.map((folder) => {
              const count = projects.filter(p => p.folder === folder).length;
              const isActive = folderFilter === folder;
              return (
                <TouchableOpacity
                  key={folder}
                  onPress={() => { Haptics.selectionAsync(); setFolderFilter(isActive ? null : folder); }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: isActive ? "#6366f1" : "transparent", borderWidth: 1, borderColor: isActive ? "#6366f1" : colors.border }}
                >
                  <Text style={{ fontSize: 9, lineHeight: 14 }}>📁</Text>
                  <Text style={{ color: isActive ? "#fff" : colors.mutedForeground, fontSize: 11, fontWeight: "700" }}>{folder}</Text>
                  <View style={{ backgroundColor: isActive ? "#ffffff30" : colors.border, borderRadius: 8, paddingHorizontal: 4, paddingVertical: 0 }}>
                    <Text style={{ color: isActive ? "#fff" : colors.mutedForeground, fontSize: 9, fontWeight: "800" }}>{count}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              onPress={() => Alert.alert("Pastas", "Use o menu ⋮ de qualquer projeto → 'Mover para pasta' para criar e organizar pastas.")}
              style={{ flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border, borderStyle: "dashed" }}
            >
              <Feather name="folder-plus" size={10} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>+ Pasta</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Toolbar de ações para pasta selecionada */}
          {folderFilter && (
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 8, gap: 6 }}>
              <Feather name="folder" size={12} color="#6366f1" />
              <Text style={{ color: "#a5b4fc", fontSize: 11, fontWeight: "700", flex: 1 }}>
                {folderFilter} · {projects.filter(p => p.folder === folderFilter).length} projeto{projects.filter(p => p.folder === folderFilter).length !== 1 ? "s" : ""}
              </Text>
              {[
                { icon: "code" as const, label: "Abrir 1°", color: "#007acc", action: () => {
                  const first = projects.find(p => p.folder === folderFilter);
                  if (first) { setActiveProject(first); router.push("/(tabs)/editor" as never); }
                }},
                { icon: "download" as const, label: "ZIP tudo", color: "#10b981", action: async () => {
                  const inFolder = projects.filter(p => p.folder === folderFilter);
                  for (const p of inFolder) await exportZip(p);
                  Alert.alert("Exportado!", `${inFolder.length} projeto(s) exportados como ZIP.`);
                }},
                { icon: "cpu" as const, label: "APK lote", color: "#8b5cf6", action: () => {
                  Alert.alert("APK em Lote", `Compilar todos os projetos da pasta "${folderFilter}"?\n\nUse o terminal: eas build --platform android`, [{ text: "OK" }]);
                }},
                { icon: "x" as const, label: "Limpar", color: colors.mutedForeground, action: () => setFolderFilter(null) },
              ].map((btn) => (
                <TouchableOpacity
                  key={btn.label}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); btn.action(); }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: btn.color + "18", borderWidth: 1, borderColor: btn.color + "35" }}
                >
                  <Feather name={btn.icon} size={11} color={btn.color} />
                  <Text style={{ color: btn.color, fontSize: 10, fontWeight: "700" }}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* ── CONTEÚDO DAS ABAS ── */}
      {activeTab === "criar" ? (
        /* Aba CRIAR */
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: bottomPadding + 16 }}>
          {/* Opções de criação */}
          {[
            { icon: "file-plus", label: "Projeto em Branco", desc: "Começa do zero", action: () => { setTemplate("vazio"); setShowNewModal(true); } },
            { icon: "upload", label: "Importar ZIP", desc: "Carrega um arquivo .zip", action: handleImportZip },
            { icon: "archive", label: "Importar TAR / TAZ / TGZ", desc: "Carrega .tar.gz, .taz, .tgz", action: handleImportTar },
            { icon: "git-branch", label: "Git Clone", desc: "Clone do GitHub ou GitLab", action: openImportGitModal },
            { icon: "package", label: "Buscar Biblioteca", desc: "npm / PyPI / etc.", action: () => setShowLibSearch(true) },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.action}
              style={[styles.criarOption, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <View style={[styles.criarOptionIcon, { backgroundColor: colors.secondary }]}>
                <Feather name={item.icon as never} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.criarOptionLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.criarOptionDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        /* Abas TUDO / RECENTE — lista de projetos */
        <>
          {selectedProjects.length > 0 && (
            <View style={[styles.selectBanner, { backgroundColor: colors.accent }]}>
              <Text style={styles.selectText}>
                {selectedProjects.length} selecionado{selectedProjects.length > 1 ? "s" : ""}
              </Text>
              <TouchableOpacity onPress={() => setSelectedProjects([])}>
                <Text style={styles.selectCancel}>Limpar</Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={filteredProjects}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              activeTab === "tudo" ? (
                <View style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <View style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: "#6366f1" }} />
                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700", letterSpacing: 0.5 }}>
                      PROJETOS PRONTOS
                    </Text>
                  </View>
                  {FEATURED_PROJECTS.map((fp) => {
                    const isAdded = projects.some(p => p.name === fp.name);
                    const isLoading = featuredImporting === fp.id;
                    return (
                      <View key={fp.id} style={{
                        backgroundColor: "#1a1040",
                        borderRadius: 10,
                        padding: 10,
                        marginBottom: 6,
                        borderWidth: 1,
                        borderColor: "#6366f144",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}>
                        <Text style={{ fontSize: 20 }}>{fp.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 1 }}>
                            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }} numberOfLines={1}>
                              {fp.name}
                            </Text>
                            {fp.badge && (
                              <View style={{ backgroundColor: "#6366f1", borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 }}>
                                <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>{fp.badge}</Text>
                              </View>
                            )}
                          </View>
                          <Text style={{ color: colors.mutedForeground, fontSize: 11 }} numberOfLines={1}>
                            {fp.description}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleAddFeaturedProject(fp)}
                          disabled={isLoading}
                          style={{
                            backgroundColor: isAdded ? colors.secondary : "#6366f1",
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            alignItems: "center",
                            minWidth: 60,
                          }}
                        >
                          {isLoading
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Text style={{ color: isAdded ? colors.foreground : "#fff", fontSize: 11, fontWeight: "700" }}>
                                {isAdded ? "Abrir" : "+ Add"}
                              </Text>
                          }
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  {filteredProjects.length > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 8 }}>
                      <View style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: colors.primary }} />
                      <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700", letterSpacing: 0.5 }}>
                        MEUS PROJETOS
                      </Text>
                    </View>
                  )}
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <ProjectCard
                project={item}
                onPress={() => handleOpenProject(item)}
                onDelete={() =>
                  Alert.alert("Excluir projeto", `Excluir "${item.name}"?`, [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Excluir", style: "destructive", onPress: () => deleteProject(item.id) },
                  ])
                }
                onExport={() => handleExportZip(item)}
                onTerminal={() => handleSendToTerminal(item)}
                onSync={() => handleSyncFromTerminal(item)}
                onMoveToFolder={() => { setFolderPickerTarget(item); setShowFolderPicker(true); }}
                onSelect={() => toggleSelect(item.id)}
                onRename={() => { setRenameTarget(item); setRenameValue(item.name); }}
                onPush={() => {
                  setPushProject(item);
                  setPushRepoUrl(item.gitRepo || "");
                  setPushSelectedRepo(null);
                  setPushCreateNew(false);
                  setPushNewRepoName("");
                  setPushUserRepos([]);
                  const savedToken = gitConfigs.find((g) => g.provider === "github")?.token || "";
                  if (savedToken) {
                    handleLoadPushRepos(savedToken);
                  }
                  setShowPushModal(true);
                }}
                onBuildApk={() => { setApkProject(item); setShowApkModal(true); }}
                isSelected={selectedProjects.includes(item.id)}
              />
            )}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
            contentContainerStyle={{ paddingBottom: bottomPadding + 16, flexGrow: filteredProjects.length === 0 ? 1 : undefined }}
            ListEmptyComponent={
              <View style={[styles.emptyState, { paddingVertical: 30 }]}>
                <Text style={[styles.emptyTitle, { color: colors.foreground, fontSize: 14 }]}>Nenhum projeto ainda</Text>
                <TouchableOpacity
                  onPress={() => setActiveTab("criar")}
                  style={[styles.emptyBtn, { backgroundColor: colors.primary, flexDirection: "row", gap: 8 }]}
                >
                  <Feather name="plus" size={16} color={colors.primaryForeground} />
                  <Text style={[styles.emptyBtnText, { color: colors.primaryForeground }]}>Criar Projeto</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </>
      )}

      {/* ── MODAL: CRIAR COM IA ── */}
      <Modal visible={showCriarComIA} transparent animationType="slide" onRequestClose={() => setShowCriarComIA(false)}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowCriarComIA(false)} />
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 18, paddingBottom: insets.bottom + 16, borderTopWidth: 1, borderColor: colors.border }}>
          {/* Handle */}
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
          </View>
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#7c3aed", alignItems: "center", justifyContent: "center" }}>
              <Feather name="cpu" size={14} color="#fff" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, flex: 1 }}>Criar com IA</Text>
            <TouchableOpacity onPress={() => setShowCriarComIA(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 4 }}>Nome (opcional)</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.secondary, marginBottom: 10 }]}
            placeholder={`Projeto IA ${projects.length + 1}`}
            placeholderTextColor={colors.mutedForeground}
            value={iaProjectName}
            onChangeText={setIaProjectName}
          />

          <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 4 }}>Descreva o que quer criar</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.secondary, height: 80, textAlignVertical: "top" }]}
            placeholder="Ex: API REST em Node.js, site em HTML/CSS, script Python..."
            placeholderTextColor={colors.mutedForeground}
            value={iaDesc}
            onChangeText={setIaDesc}
            multiline
            numberOfLines={3}
          />

          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <TouchableOpacity
              onPress={() => setShowCriarComIA(false)}
              style={[styles.primaryBtn, { flex: 1, backgroundColor: colors.secondary }]}
            >
              <Text style={[styles.primaryBtnText, { color: colors.foreground }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCriarComIA}
              disabled={!iaDesc.trim() || iaGenerating}
              style={[styles.primaryBtn, { flex: 2, backgroundColor: iaDesc.trim() && !iaGenerating ? "#7c3aed" : colors.secondary }]}
            >
              {iaGenerating ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="cpu" size={14} color={iaDesc.trim() ? "#fff" : colors.mutedForeground} />}
              <Text style={[styles.primaryBtnText, { color: iaDesc.trim() && !iaGenerating ? "#fff" : colors.mutedForeground }]}>
                {iaGenerating ? "Gerando..." : "Criar com IA"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Renomear Projeto */}
      <Modal visible={!!renameTarget} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setRenameTarget(null)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={[styles.renameBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.foreground, marginBottom: 12 }]}>
                ✏️  Renomear Projeto
              </Text>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.primary, backgroundColor: colors.secondary }]}
                value={renameValue}
                onChangeText={setRenameValue}
                placeholder="Novo nome do projeto"
                placeholderTextColor={colors.mutedForeground}
                autoFocus
                selectTextOnFocus
                returnKeyType="done"
                onSubmitEditing={handleRename}
              />
              <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                <TouchableOpacity
                  onPress={() => setRenameTarget(null)}
                  style={[styles.primaryBtn, { flex: 1, backgroundColor: colors.secondary }]}
                >
                  <Text style={[styles.primaryBtnText, { color: colors.foreground }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRename}
                  disabled={!renameValue.trim()}
                  style={[styles.primaryBtn, { flex: 1, backgroundColor: renameValue.trim() ? colors.primary : colors.secondary }]}
                >
                  <Feather name="check" size={14} color={renameValue.trim() ? colors.primaryForeground : colors.mutedForeground} />
                  <Text style={[styles.primaryBtnText, { color: renameValue.trim() ? colors.primaryForeground : colors.mutedForeground }]}>
                    Salvar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal: Mover para Pasta */}
      <Modal visible={showFolderPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => { setShowFolderPicker(false); setFolderPickerTarget(null); }}>
          <TouchableOpacity activeOpacity={1} style={{ width: "100%" }}>
            <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, borderTopWidth: 1, borderColor: colors.border, position: "absolute", bottom: 0, left: 0, right: 0 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: 16 }} />
              <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700", marginBottom: 4 }}>
                📁 Mover para Pasta
              </Text>
              {folderPickerTarget && (
                <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 16 }}>
                  Projeto: <Text style={{ color: colors.foreground }}>{folderPickerTarget.name}</Text>
                  {folderPickerTarget.folder ? ` — pasta atual: ${folderPickerTarget.folder}` : " — sem pasta"}
                </Text>
              )}
              {/* Sem pasta */}
              <TouchableOpacity
                onPress={() => {
                  if (folderPickerTarget) updateProject(folderPickerTarget.id, { folder: undefined });
                  setShowFolderPicker(false); setFolderPickerTarget(null);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, backgroundColor: !folderPickerTarget?.folder ? colors.primary + "22" : colors.secondary, marginBottom: 6, borderWidth: 1, borderColor: !folderPickerTarget?.folder ? colors.primary + "44" : colors.border }}
              >
                <Feather name="inbox" size={16} color={!folderPickerTarget?.folder ? colors.primary : colors.mutedForeground} />
                <Text style={{ color: !folderPickerTarget?.folder ? colors.primary : colors.foreground, fontWeight: "600" }}>Sem pasta (raiz)</Text>
                {!folderPickerTarget?.folder && <Feather name="check" size={14} color={colors.primary} style={{ marginLeft: "auto" }} />}
              </TouchableOpacity>
              {/* Pastas existentes + padrões */}
              {Array.from(new Set([...allFolders, ...DEFAULT_FOLDERS])).map((folder) => (
                <TouchableOpacity
                  key={folder}
                  onPress={() => {
                    if (folderPickerTarget) updateProject(folderPickerTarget.id, { folder });
                    setShowFolderPicker(false); setFolderPickerTarget(null);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, backgroundColor: folderPickerTarget?.folder === folder ? "#6366f122" : colors.secondary, marginBottom: 6, borderWidth: 1, borderColor: folderPickerTarget?.folder === folder ? "#6366f144" : colors.border }}
                >
                  <Text style={{ fontSize: 14 }}>📁</Text>
                  <Text style={{ color: folderPickerTarget?.folder === folder ? "#a5b4fc" : colors.foreground, fontWeight: "600", flex: 1 }}>{folder}</Text>
                  <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{projects.filter(p => p.folder === folder).length} proj.</Text>
                  {folderPickerTarget?.folder === folder && <Feather name="check" size={14} color="#a5b4fc" />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => {
                  setShowFolderPicker(false);
                  if (Platform.OS === "ios") {
                    Alert.prompt("Nova Pasta", "Nome da nova pasta:", (name) => {
                      if (name?.trim() && folderPickerTarget) {
                        updateProject(folderPickerTarget.id, { folder: name.trim() });
                        setFolderPickerTarget(null);
                      }
                    });
                  } else {
                    Alert.alert("Nova Pasta", "Digite o nome da nova pasta e toque em Mover.", [
                      { text: "Cancelar", style: "cancel", onPress: () => setFolderPickerTarget(null) },
                      ...["APK/Android", "Web/PWA", "API/Backend", "Estudo", "Experimento", "Clientes", "Freelance"].map(name => ({
                        text: name,
                        onPress: () => {
                          if (folderPickerTarget) { updateProject(folderPickerTarget.id, { folder: name }); setFolderPickerTarget(null); }
                        },
                      })),
                    ]);
                  }
                }}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed", marginTop: 4 }}
              >
                <Feather name="folder-plus" size={15} color={colors.mutedForeground} />
                <Text style={{ color: colors.mutedForeground, fontWeight: "600" }}>Nova pasta personalizada</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal: Enviar para GitHub */}
      <Modal visible={showPushModal} animationType="slide" presentationStyle="pageSheet" statusBarTranslucent onRequestClose={() => { setShowPushModal(false); setPushRepoUrl(""); setPushToken(""); setPushSelectedRepo(null); setPushCreateNew(false); setPushNewRepoName(""); setPushUserRepos([]); }}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: Math.max(24, insets.top + 12) }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              📤  Enviar para GitHub
            </Text>
            <TouchableOpacity onPress={() => { setShowPushModal(false); setPushRepoUrl(""); setPushToken(""); setPushSelectedRepo(null); setPushCreateNew(false); setPushNewRepoName(""); setPushUserRepos([]); }}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            {pushProject && (
              <View style={[styles.hintBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="folder" size={13} color={colors.primary} />
                <Text style={[styles.hintText, { color: colors.foreground, fontWeight: "600" }]}>
                  {pushProject.name}  ({pushProject.files?.length || 0} arquivo(s))
                </Text>
              </View>
            )}

            {/* Token */}
            {(() => {
              const savedToken = gitConfigs.find((g) => g.provider === "github")?.token || "";
              const effectiveToken = pushToken || savedToken;
              return (
                <>
                  {savedToken && !pushToken ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#22c55e14", borderRadius: 8, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: "#22c55e33" }}>
                      <Feather name="check-circle" size={14} color="#22c55e" />
                      <Text style={{ color: "#22c55e", fontSize: 13, flex: 1 }}>
                        Usando token salvo: @{gitConfigs.find((g) => g.provider === "github")?.username || "GitHub"}
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text style={[styles.label, { color: colors.mutedForeground }]}>Token GitHub (ghp_...)</Text>
                      <TextInput
                        style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                        value={pushToken}
                        onChangeText={(t) => {
                          setPushToken(t);
                          setPushUserRepos([]);
                          setPushSelectedRepo(null);
                          if (t.length > 20) handleLoadPushRepos(t);
                        }}
                        placeholder="ghp_xxxxxxxxxxxx"
                        placeholderTextColor={colors.mutedForeground}
                        autoCapitalize="none"
                        autoCorrect={false}
                        secureTextEntry
                      />
                    </>
                  )}

                  {/* Carregar repos se ainda não carregou */}
                  {effectiveToken && pushUserRepos.length === 0 && !pushLoadingRepos && (
                    <TouchableOpacity
                      onPress={() => handleLoadPushRepos(effectiveToken)}
                      style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}
                    >
                      <Feather name="refresh-cw" size={14} color={colors.primary} />
                      <Text style={{ color: colors.primary, fontSize: 14 }}>Carregar meus repositórios</Text>
                    </TouchableOpacity>
                  )}
                  {pushLoadingRepos && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>Carregando repositórios...</Text>
                    </View>
                  )}
                </>
              );
            })()}

            {/* Lista de repos */}
            {pushUserRepos.length > 0 && !pushCreateNew && (
              <>
                {pushGhLogin ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Feather name="github" size={13} color="#22c55e" />
                    <Text style={{ color: "#22c55e", fontSize: 12, fontWeight: "700" }}>@{pushGhLogin}</Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>— {pushUserRepos.length} repositórios</Text>
                  </View>
                ) : null}
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Selecionar repositório</Text>
                <View style={{ borderRadius: 10, borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginBottom: 8 }}>
                  {pushUserRepos.slice(0, 40).map((r) => {
                    const selected = pushSelectedRepo?.name === r.name && pushSelectedRepo?.owner === r.owner.login;
                    return (
                      <TouchableOpacity
                        key={r.id}
                        onPress={() => setPushSelectedRepo({ name: r.name, owner: r.owner.login })}
                        style={{
                          flexDirection: "row", alignItems: "center", gap: 10,
                          paddingHorizontal: 14, paddingVertical: 10,
                          backgroundColor: selected ? colors.primary + "22" : colors.card,
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderBottomColor: colors.border,
                        }}
                      >
                        <Feather name={r.private ? "lock" : "unlock"} size={13} color={selected ? colors.primary : colors.mutedForeground} />
                        <Text style={{ color: selected ? colors.primary : colors.foreground, fontWeight: selected ? "700" : "500", flex: 1, fontSize: 14 }}>{r.name}</Text>
                        {selected && <Feather name="check-circle" size={16} color={colors.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {pushSelectedRepo && (
                  <Text style={{ color: colors.mutedForeground, fontSize: 11, marginBottom: 8 }}>
                    Enviando para: github.com/{pushSelectedRepo.owner}/{pushSelectedRepo.name}
                  </Text>
                )}
              </>
            )}

            {/* Criar novo repo */}
            <TouchableOpacity
              onPress={() => { setPushCreateNew(!pushCreateNew); setPushSelectedRepo(null); }}
              style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 8, backgroundColor: pushCreateNew ? "#22c55e22" : colors.card, borderWidth: 1, borderColor: pushCreateNew ? "#22c55e" : colors.border, marginBottom: 8 }}
            >
              <Feather name={pushCreateNew ? "check-square" : "plus-square"} size={16} color={pushCreateNew ? "#22c55e" : colors.mutedForeground} />
              <Text style={{ color: pushCreateNew ? "#22c55e" : colors.foreground, fontSize: 14, fontWeight: "600" }}>
                Criar repositório novo automaticamente
              </Text>
            </TouchableOpacity>

            {pushCreateNew && (
              <>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Nome do novo repositório</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                  value={pushNewRepoName}
                  onChangeText={setPushNewRepoName}
                  placeholder={pushProject?.name?.toLowerCase().replace(/\s+/g, "-") || "meu-projeto"}
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {pushGhLogin && pushNewRepoName.trim() && (
                  <Text style={{ color: colors.mutedForeground, fontSize: 11, marginBottom: 8 }}>
                    Será criado: github.com/{pushGhLogin}/{pushNewRepoName.trim()}
                  </Text>
                )}
              </>
            )}

            {/* Branch */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Branch</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
              value={pushBranch}
              onChangeText={setPushBranch}
              placeholder="main"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Progresso do push */}
            {pushing && (
              <View style={{ backgroundColor: colors.card, borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600", marginBottom: 8 }}>
                  {pushProgress.phase || "Enviando..."}
                </Text>
                <View style={{ backgroundColor: colors.muted, borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <View style={{
                    backgroundColor: "#059669",
                    height: 6,
                    borderRadius: 4,
                    width: pushProgress.total > 0
                      ? `${Math.round((pushProgress.cur / pushProgress.total) * 100)}%`
                      : "5%",
                  }} />
                </View>
                {pushProgress.total > 0 && (
                  <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 6 }}>
                    {pushProgress.cur} / {pushProgress.total} arquivos
                    {" · "}{Math.round((pushProgress.cur / pushProgress.total) * 100)}%
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              onPress={handlePushToGit}
              disabled={pushing || (!pushSelectedRepo && !pushCreateNew && !pushRepoUrl.trim())}
              style={[styles.primaryBtn, {
                backgroundColor: !pushing && (pushSelectedRepo || (pushCreateNew && pushNewRepoName.trim()) || pushRepoUrl.trim()) ? "#059669" : colors.muted
              }]}
            >
              <Feather name="upload-cloud" size={16} color="#fff" />
              <Text style={[styles.primaryBtnText, { color: "#fff" }]}>
                {pushing ? "Enviando..." : pushCreateNew ? "Criar Repo e Enviar" : "Enviar para o Repositório"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal: Menu de Ações */}
      <Modal visible={showActionsMenu} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowActionsMenu(false)}
        >
          <View style={[styles.actionsMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.menuTitle, { color: colors.mutedForeground }]}>IMPORTAR</Text>
            {[
              { label: "Importar ZIP", icon: "upload", action: handleImportZip },
              { label: "Importar TAR/TAR.GZ", icon: "archive", action: handleImportTar },
              { label: "Clonar do GitHub", icon: "github", action: () => { setShowActionsMenu(false); openImportGitModal(); } },
              { label: "Clonar do GitLab", icon: "git-branch", action: () => { setShowActionsMenu(false); setGitProvider("gitlab"); openImportGitModal(); } },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.action}
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
              >
                <Feather name={item.icon as never} size={16} color={colors.primary} />
                <Text style={[styles.menuItemText, { color: colors.foreground }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <Text style={[styles.menuTitle, { color: colors.mutedForeground, marginTop: 8 }]}>FERRAMENTAS</Text>
            <TouchableOpacity
              onPress={() => { setShowActionsMenu(false); setShowSiteExtractor(true); }}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
            >
              <Feather name="globe" size={16} color="#22c55e" />
              <Text style={[styles.menuItemText, { color: colors.foreground }]}>Extrair Site (HTML + Rotas)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setShowActionsMenu(false); setShowPwaModal(true); }}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
            >
              <Feather name="package" size={16} color="#f59e0b" />
              <Text style={[styles.menuItemText, { color: colors.foreground }]}>Converter PWA em APK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal: Converter Site/PWA em APK */}
      <Modal visible={showPwaModal} animationType="slide" presentationStyle="pageSheet" statusBarTranslucent onRequestClose={() => { setShowPwaModal(false); setPwaUrl(""); }}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: Math.max(24, insets.top + 12) }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>📦 Site → APK</Text>
            <TouchableOpacity onPress={() => { setShowPwaModal(false); setPwaUrl(""); }}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>

            {/* URL Input */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>URL do seu site</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card, marginBottom: 6 }]}
              value={pwaUrl}
              onChangeText={setPwaUrl}
              placeholder="https://meusite.com"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 16 }}>
              Cole a URL acima e escolha o serviço abaixo. Todos são gratuitos.
            </Text>

            {/* Opção 1: GoNative — funciona com QUALQUER site */}
            <View style={{ backgroundColor: "#1e3a5f", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#2563eb44" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <View style={{ backgroundColor: "#2563eb", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>RECOMENDADO</Text>
                </View>
                <Text style={{ color: "#93c5fd", fontSize: 15, fontWeight: "700" }}>GoNative.io</Text>
              </View>
              <Text style={{ color: "#bfdbfe", fontSize: 13, marginBottom: 12, lineHeight: 19 }}>
                Funciona com QUALQUER site — não precisa de manifest, service worker ou configuração especial. Só a URL.
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: "#2563eb", borderRadius: 10, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, opacity: pwaUrl.trim() ? 1 : 0.5 }}
                disabled={!pwaUrl.trim()}
                onPress={() => {
                  const url = pwaUrl.trim().startsWith("http") ? pwaUrl.trim() : `https://${pwaUrl.trim()}`;
                  Linking.openURL(`https://gonative.io/app/create?url=${encodeURIComponent(url)}`);
                }}
              >
                <Feather name="external-link" size={16} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Abrir no GoNative →</Text>
              </TouchableOpacity>
              <Text style={{ color: "#93c5fd88", fontSize: 11, marginTop: 8, textAlign: "center" }}>
                Gratuito para 1 app · Baixa o APK direto
              </Text>
            </View>

            {/* Opção 2: AppMySite */}
            <View style={{ backgroundColor: "#1a1a2e", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#7c3aed44" }}>
              <Text style={{ color: "#c4b5fd", fontSize: 15, fontWeight: "700", marginBottom: 6 }}>AppMySite</Text>
              <Text style={{ color: "#ddd6fe", fontSize: 13, marginBottom: 12, lineHeight: 19 }}>
                Interface simples, gera APK automaticamente. Funciona com WordPress, Wix, sites normais e PWAs.
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: "#7c3aed", borderRadius: 10, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, opacity: pwaUrl.trim() ? 1 : 0.5 }}
                disabled={!pwaUrl.trim()}
                onPress={() => {
                  const url = pwaUrl.trim().startsWith("http") ? pwaUrl.trim() : `https://${pwaUrl.trim()}`;
                  Linking.openURL(`https://www.appmysite.com/?url=${encodeURIComponent(url)}`);
                }}
              >
                <Feather name="external-link" size={16} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Abrir no AppMySite →</Text>
              </TouchableOpacity>
            </View>

            {/* Opção 3: WebIntoApp */}
            <View style={{ backgroundColor: "#14290a", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#16a34a44" }}>
              <Text style={{ color: "#86efac", fontSize: 15, fontWeight: "700", marginBottom: 6 }}>WebIntoApp</Text>
              <Text style={{ color: "#bbf7d0", fontSize: 13, marginBottom: 12, lineHeight: 19 }}>
                O mais simples: só cole a URL e baixe o APK. Sem cadastro, sem configuração.
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: "#16a34a", borderRadius: 10, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, opacity: pwaUrl.trim() ? 1 : 0.5 }}
                disabled={!pwaUrl.trim()}
                onPress={() => {
                  const url = pwaUrl.trim().startsWith("http") ? pwaUrl.trim() : `https://${pwaUrl.trim()}`;
                  Linking.openURL(`https://www.webintoapp.com/store/new?url=${encodeURIComponent(url)}`);
                }}
              >
                <Feather name="external-link" size={16} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Abrir no WebIntoApp →</Text>
              </TouchableOpacity>
            </View>

            {/* Opção 4: PWABuilder (requer manifest) */}
            <View style={{ backgroundColor: "#292929", borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#555" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Text style={{ color: "#e5e7eb", fontSize: 15, fontWeight: "700" }}>PWABuilder</Text>
                <View style={{ backgroundColor: "#78350f", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ color: "#fbbf24", fontSize: 10, fontWeight: "700" }}>REQUER MANIFEST</Text>
                </View>
              </View>
              <Text style={{ color: "#9ca3af", fontSize: 13, marginBottom: 12, lineHeight: 19 }}>
                Oficial da Microsoft. Exige manifest.json e service worker — por isso pode dar erros. Só use se o site já for PWA completo.
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: "#374151", borderRadius: 10, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, opacity: pwaUrl.trim() ? 1 : 0.5 }}
                disabled={!pwaUrl.trim()}
                onPress={() => {
                  const url = pwaUrl.trim().startsWith("http") ? pwaUrl.trim() : `https://${pwaUrl.trim()}`;
                  Linking.openURL(`https://www.pwabuilder.com/?site=${encodeURIComponent(url)}`);
                }}
              >
                <Feather name="external-link" size={16} color="#9ca3af" />
                <Text style={{ color: "#9ca3af", fontWeight: "600", fontSize: 14 }}>Abrir no PWABuilder</Text>
              </TouchableOpacity>
            </View>

            {/* Dica */}
            <View style={{ backgroundColor: "#0c1a0c", borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#16a34a33" }}>
              <Text style={{ color: "#4ade80", fontSize: 13, fontWeight: "600", marginBottom: 6 }}>💡 Dica: qual escolher?</Text>
              <Text style={{ color: "#86efac", fontSize: 13, lineHeight: 20 }}>
                {"• Site normal/qualquer → GoNative ou WebIntoApp\n• WordPress/Wix → AppMySite\n• Já tem manifest.json → PWABuilder\n• Quer personalizar muito → GoNative (plano pago)"}
              </Text>
            </View>

          </ScrollView>
        </View>
      </Modal>

      {/* Modal: Compilar APK */}
      <Modal visible={showApkModal} animationType="slide" presentationStyle="pageSheet" statusBarTranslucent onRequestClose={() => setShowApkModal(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: Math.max(24, insets.top + 12) }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>🔨 Compilar APK</Text>
            <TouchableOpacity onPress={() => setShowApkModal(false)}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>

            {/* Info do projeto */}
            {apkProject && (() => {
              const appJsonFile = apkProject.files.find(f => f.name === "app.json" || f.path === "app.json");
              let isExpo = false;
              let slug = "meu-app";
              let pkg = "com.meuapp";
              if (appJsonFile) {
                try {
                  const parsed = JSON.parse(appJsonFile.content);
                  if (parsed?.expo) {
                    isExpo = true;
                    slug = parsed.expo.slug || slug;
                    pkg = parsed.expo.android?.package || pkg;
                  }
                } catch {}
              }

              const termuxCmds = isExpo ? [
                "# 1. Instala Node.js no Termux",
                "pkg install nodejs",
                "",
                "# 2. Instala o EAS CLI",
                "npm install -g eas-cli",
                "",
                "# 3. Entra na pasta do projeto extraído",
                `cd ~/storage/downloads/${slug}`,
                "",
                "# 4. Instala as dependências",
                "npm install",
                "",
                "# 5. Faz login na sua conta Expo",
                "eas login",
                "",
                "# 6. Cria o projeto no EAS (só na primeira vez)",
                "eas init",
                "",
                "# 7. COMPILA O APK 🚀",
                "EAS_NO_VCS=1 eas build --platform android --profile preview",
              ] : [
                "pkg install nodejs",
                "npm install -g eas-cli",
                "eas login",
                "EAS_NO_VCS=1 eas build --platform android --profile preview",
              ];

              return (
                <>
                  {/* Cabeçalho do projeto */}
                  <View style={{ backgroundColor: isExpo ? "#1e3a5f" : colors.card, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: isExpo ? "#2563eb55" : colors.border }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      {isExpo && <View style={{ backgroundColor: "#2563eb", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>EXPO / REACT NATIVE</Text>
                      </View>}
                    </View>
                    <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>{apkProject.name}</Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}>
                      {apkProject.files.length} arquivo(s){isExpo ? ` · slug: ${slug} · pkg: ${pkg}` : ""}
                    </Text>
                  </View>

                  {/* Opção 1: EAS Build Nuvem */}
                  <TouchableOpacity
                    style={{ backgroundColor: "#0ea5e9", borderRadius: 12, padding: 16, marginBottom: 12 }}
                    onPress={() => Linking.openURL(`https://expo.dev/accounts/${settings.expoAccount || "maikon1"}/projects/${slug}/builds`)}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <Feather name="cloud" size={20} color="#fff" />
                      <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>EAS Build — Nuvem ☁️</Text>
                    </View>
                    <Text style={{ color: "#fff", fontSize: 13, opacity: 0.9 }}>
                      Abre o painel de builds do projeto{isExpo ? ` "${slug}"` : ""} no Expo.{"\n"}
                      Grátis para uso pessoal.
                    </Text>
                  </TouchableOpacity>

                  {/* Opção 2: Via Termux - Passo a Passo */}
                  <View style={{ backgroundColor: "#0c2010", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#16a34a55" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <Feather name="terminal" size={20} color="#4ade80" />
                      <Text style={{ color: "#4ade80", fontSize: 15, fontWeight: "700" }}>Via Termux — Passo a Passo</Text>
                    </View>
                    <Text style={{ color: "#86efac", fontSize: 12, marginBottom: 12, lineHeight: 18 }}>
                      {isExpo
                        ? `Projeto Expo detectado! Extraia o ZIP na pasta Downloads com o nome "${slug}" e execute:`
                        : "Execute os comandos abaixo no Termux. Toque em cada comando para copiar:"}
                    </Text>
                    {termuxCmds.map((cmd, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => {
                          if (cmd && !cmd.startsWith("#")) {
                            Clipboard.setStringAsync(cmd);
                            Alert.alert("✅ Copiado!", `Comando copiado. Cole no Termux.`);
                          }
                        }}
                        activeOpacity={!cmd || cmd.startsWith("#") ? 1 : 0.7}
                      >
                        <Text style={{
                          color: !cmd ? "transparent" : cmd.startsWith("#") ? "#4ade8077" : "#bbf7d0",
                          fontFamily: "monospace",
                          fontSize: 12,
                          marginBottom: cmd ? 3 : 6,
                          backgroundColor: !cmd || cmd.startsWith("#") ? "transparent" : "#ffffff11",
                          paddingHorizontal: !cmd || cmd.startsWith("#") ? 0 : 8,
                          paddingVertical: !cmd || cmd.startsWith("#") ? 0 : 4,
                          borderRadius: 4,
                        }}>
                          {cmd || " "}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <Text style={{ color: "#4ade8077", fontSize: 11, marginTop: 8 }}>
                      Toque em qualquer comando para copiar
                    </Text>
                  </View>

                  {/* Opção 3: GitHub Actions */}
                  <TouchableOpacity
                    style={{ backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12 }}
                    onPress={() => Linking.openURL("https://github.com/features/actions")}
                  >
                    <Feather name="git-branch" size={20} color={colors.mutedForeground} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>GitHub Actions</Text>
                      <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Compila automaticamente a cada push no repositório</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>

                  {/* Opção 4: Site → APK */}
                  {!isExpo && (
                    <TouchableOpacity
                      style={{ backgroundColor: "#451a03", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#92400e55", flexDirection: "row", alignItems: "center", gap: 12 }}
                      onPress={() => { setShowApkModal(false); setTimeout(() => setShowPwaModal(true), 300); }}
                    >
                      <Feather name="package" size={20} color="#fbbf24" />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#fbbf24", fontSize: 14, fontWeight: "600" }}>Site/PWA → APK</Text>
                        <Text style={{ color: "#fde68a", fontSize: 12 }}>Converta este projeto web em APK</Text>
                      </View>
                      <Feather name="chevron-right" size={16} color="#fbbf24" />
                    </TouchableOpacity>
                  )}
                </>
              );
            })()}

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.secondary, marginTop: 8 }]}
              onPress={() => setShowApkModal(false)}
            >
              <Text style={[styles.primaryBtnText, { color: colors.foreground }]}>Fechar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal: Novo Projeto */}
      <Modal visible={showNewModal} animationType="slide" presentationStyle="pageSheet" statusBarTranslucent onRequestClose={() => setShowNewModal(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: Math.max(24, insets.top + 12) }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Novo Projeto</Text>
            <TouchableOpacity onPress={() => setShowNewModal(false)}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              Nome do projeto <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>(opcional — auto-gerado se vazio)</Text>
            </Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
              value={newName}
              onChangeText={setNewName}
              placeholder={`Projeto ${projects.length + 1}`}
              placeholderTextColor={colors.mutedForeground}
              autoFocus
            />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Descrição (opcional)</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
              value={newDesc}
              onChangeText={setNewDesc}
              placeholder="Descrição do projeto"
              placeholderTextColor={colors.mutedForeground}
            />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Template</Text>
            <View style={styles.templateGrid}>
              {Object.entries(TEMPLATES).map(([key, tmpl]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setTemplate(key)}
                  style={[
                    styles.templateCard,
                    {
                      backgroundColor: template === key ? colors.primary : colors.card,
                      borderColor: template === key ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Feather
                    name={tmpl.icon as never}
                    size={13}
                    color={template === key ? colors.primaryForeground : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.templateLabel,
                      { color: template === key ? colors.primaryForeground : colors.foreground },
                    ]}
                    numberOfLines={1}
                  >
                    {tmpl.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={handleCreateProject}
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="plus-circle" size={16} color={colors.primaryForeground} />
              <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
                Criar Projeto
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal: Git Import */}
      <Modal visible={showGitModal} animationType="slide" presentationStyle="pageSheet" statusBarTranslucent onRequestClose={() => { setShowGitModal(false); setGitToken(""); setGitUrl(""); setImportUserRepos([]); setImportShowUrl(false); }}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: Math.max(24, insets.top + 12) }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Importar do GitHub</Text>
            <TouchableOpacity onPress={() => { setShowGitModal(false); setGitToken(""); setGitUrl(""); setImportUserRepos([]); setImportShowUrl(false); }}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            {/* Token - auto-fill from saved config */}
            {(() => {
              const savedToken = gitConfigs.find((g) => g.provider === "github")?.token || "";
              const effectiveToken = gitToken || savedToken;
              return (
                <>
                  {savedToken && !gitToken ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#22c55e14", borderRadius: 8, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: "#22c55e33" }}>
                      <Feather name="check-circle" size={14} color="#22c55e" />
                      <Text style={{ color: "#22c55e", fontSize: 13, flex: 1 }}>
                        Token salvo: @{gitConfigs.find((g) => g.provider === "github")?.username || "GitHub"}
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text style={[styles.label, { color: colors.mutedForeground }]}>Token GitHub (ghp_...)</Text>
                      <TextInput
                        style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                        value={gitToken}
                        onChangeText={(t) => {
                          setGitToken(t);
                          setImportUserRepos([]);
                          if (t.length > 20) handleLoadImportRepos(t);
                        }}
                        placeholder="ghp_xxxxxxxxxxxx"
                        placeholderTextColor={colors.mutedForeground}
                        autoCapitalize="none"
                        autoCorrect={false}
                        secureTextEntry
                        autoFocus={!savedToken}
                      />
                      <Text style={{ color: colors.mutedForeground, fontSize: 11, marginBottom: 12, lineHeight: 16 }}>
                        github.com → Settings → Developer settings → Personal access tokens → Generate (escopo: repo)
                      </Text>
                    </>
                  )}

                  {/* Carregar repos */}
                  {effectiveToken && importUserRepos.length === 0 && !importLoadingRepos && (
                    <TouchableOpacity
                      onPress={() => handleLoadImportRepos(effectiveToken)}
                      style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}
                    >
                      <Feather name="refresh-cw" size={14} color={colors.primary} />
                      <Text style={{ color: colors.primary, fontSize: 14 }}>Carregar meus repositórios</Text>
                    </TouchableOpacity>
                  )}
                  {importLoadingRepos && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>Carregando repositórios...</Text>
                    </View>
                  )}
                </>
              );
            })()}

            {/* Lista de repos */}
            {importUserRepos.length > 0 && (
              <>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  Selecione um repositório ({importUserRepos.length})
                </Text>
                <View style={{ borderRadius: 10, borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginBottom: 12 }}>
                  {importUserRepos.slice(0, 50).map((r) => (
                    <TouchableOpacity
                      key={r.id}
                      onPress={() => {
                        const url = `https://github.com/${r.owner.login}/${r.name}`;
                        handleImportGit(url);
                      }}
                      disabled={importing}
                      style={{
                        flexDirection: "row", alignItems: "center", gap: 10,
                        paddingHorizontal: 14, paddingVertical: 12,
                        backgroundColor: colors.card,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <Feather name={r.private ? "lock" : "unlock"} size={13} color={colors.mutedForeground} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>{r.name}</Text>
                        <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{r.owner.login} · {r.default_branch || "main"}</Text>
                      </View>
                      <Feather name="download" size={14} color={colors.primary} />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Importar URL pública (fallback) */}
            <TouchableOpacity
              onPress={() => setImportShowUrl(!importShowUrl)}
              style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}
            >
              <Feather name={importShowUrl ? "chevron-down" : "chevron-right"} size={14} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
                Importar URL pública (sem token)
              </Text>
            </TouchableOpacity>

            {importShowUrl && (
              <>
                <TextInput
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                  value={gitUrl}
                  onChangeText={(text) => {
                    setGitUrl(text);
                    if (text.includes("gitlab")) setGitProvider("gitlab");
                    else setGitProvider("github");
                  }}
                  placeholder="https://github.com/usuario/repositorio"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => handleImportGit()}
                  disabled={!gitUrl.trim() || importing}
                  style={[styles.primaryBtn, { backgroundColor: gitUrl.trim() && !importing ? colors.primary : colors.muted }]}
                >
                  <Feather name="download-cloud" size={16} color={colors.primaryForeground} />
                  <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
                    {importing ? "Importando..." : "Importar URL"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {importing && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14, backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.border, marginTop: 12 }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={{ color: colors.foreground, fontSize: 13 }}>Importando repositório...</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Modal: Combinar */}
      <Modal visible={showCombineModal} animationType="slide" presentationStyle="pageSheet" statusBarTranslucent onRequestClose={() => setShowCombineModal(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: Math.max(24, insets.top + 12) }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Combinar Projetos</Text>
            <TouchableOpacity onPress={() => setShowCombineModal(false)}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
              Combinando {selectedProjects.length} projetos em um novo
            </Text>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Nome do projeto combinado</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
              value={combineName}
              onChangeText={setCombineName}
              placeholder="Projeto Combinado"
              placeholderTextColor={colors.mutedForeground}
              autoFocus
            />
            <TouchableOpacity
              onPress={handleCombine}
              disabled={!combineName.trim()}
              style={[styles.primaryBtn, { backgroundColor: combineName.trim() ? colors.primary : colors.muted }]}
            >
              <Feather name="layers" size={16} color={colors.primaryForeground} />
              <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>Combinar Projetos</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <LibrarySearch visible={showLibSearch} onClose={() => setShowLibSearch(false)} />
      <ProjectPlanModal visible={showPlan} onClose={() => setShowPlan(false)} />

      {/* ── OVERLAY DE PROGRESSO DE IMPORTAÇÃO ── */}
      {importProgress && (
        <View style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.88)",
          alignItems: "center", justifyContent: "center",
          zIndex: 9999,
        }}>
          <View style={{
            backgroundColor: "#161b22", borderRadius: 20, padding: 28,
            width: "88%", maxWidth: 380,
            borderWidth: 1, borderColor: "#30363d",
            alignItems: "center",
          }}>
            {/* Spinner */}
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "#238636", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <ActivityIndicator size="large" color="#fff" />
            </View>

            {/* Título */}
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700", textAlign: "center", marginBottom: 10 }}>
              Importando projeto...
            </Text>

            {/* Fase / arquivo atual — já contém "X / Y arquivos" */}
            <View style={{ backgroundColor: "#0d1117", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, width: "100%", marginBottom: 16 }}>
              <Text style={{ color: "#58a6ff", fontSize: 13, textAlign: "center", lineHeight: 20 }}>
                {importProgress.phase}
              </Text>
            </View>

            {/* Barra de progresso */}
            <View style={{ width: "100%", height: 8, backgroundColor: "#21262d", borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
              <View style={{
                width: `${Math.max(3, importProgress.pct)}%`,
                height: "100%",
                backgroundColor: importProgress.pct >= 95 ? "#3fb950" : "#238636",
                borderRadius: 6,
              }} />
            </View>

            <Text style={{ color: "#8b949e", fontSize: 11 }}>
              {importProgress.pct}% concluído · não feche o app
            </Text>
          </View>
        </View>
      )}

      {/* Extrator de Sites */}
      <SiteExtractor
        visible={showSiteExtractor}
        onClose={() => setShowSiteExtractor(false)}
        onImport={(files) => {
          if (!activeProject) {
            Alert.alert("Atenção", "Selecione ou crie um projeto primeiro para importar os arquivos.");
            return;
          }
          const newFiles = files.map((f) => ({
            id: Math.random().toString(36).slice(2),
            name: f.name,
            path: f.name,
            content: f.content,
            language: f.name.endsWith(".html") ? "html" : "markdown",
          }));
          updateProject(activeProject.id, { files: [...(activeProject.files || []), ...newFiles] });
        }}
      />
    </View>
  );
}
