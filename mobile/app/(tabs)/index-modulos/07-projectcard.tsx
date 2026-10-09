function ProjectCard({
  project,
  onPress,
  onDelete,
  onExport,
  onTerminal,
  onSync,
  onSelect,
  onRename,
  onPush,
  onBuildApk,
  onMoveToFolder,
  isSelected,
}: {
  project: Project;
  onPress: () => void;
  onDelete: () => void;
  onExport: () => void;
  onTerminal: () => void;
  onSync: () => void;
  onSelect: () => void;
  onRename: () => void;
  onPush: () => void;
  onBuildApk: () => void;
  onMoveToFolder: () => void;
  isSelected: boolean;
}) {
  const colors = useColors();
  const avatarColor = getAvatarColor(project.name);
  const initials = getInitials(project.name);
  const hasGit = !!project.gitRepo;

  const showMenu = () => {
    const fileCount = project.files.length.toLocaleString("pt-BR");
    Alert.alert(
      project.name,
      `${fileCount} arquivo${project.files.length !== 1 ? "s" : ""}${project.folder ? ` · 📁 ${project.folder}` : ""}`,
      [
        { text: "📂  Abrir no Editor", onPress },
        { text: "📡  Enviar para Terminal", onPress: onTerminal },
        { text: "↩️  Sincronizar do Terminal", onPress: onSync },
        { text: "🔨  Compilar APK", onPress: onBuildApk },
        { text: "📦  Exportar ZIP", onPress: onExport },
        { text: "📁  Mover para pasta", onPress: onMoveToFolder },
        { text: "✏️  Renomear", onPress: onRename },
        { text: "🔗  Selecionar para combinar", onPress: onSelect },
        { text: "📤  Enviar para GitHub", onPress: onPush },
        ...(hasGit ? [
          { text: "🌐  VS Code Web", onPress: () => openInEditor(project, "vscode", onPush) },
          { text: "⚡  StackBlitz", onPress: () => openInEditor(project, "stackblitz", onPush) },
          { text: "🟠  Gitpod", onPress: () => openInEditor(project, "gitpod", onPush) },
        ] : []),
        { text: "🗑️  Excluir", style: "destructive", onPress: onDelete },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        showMenu();
      }}
      style={[styles.card, { backgroundColor: isSelected ? avatarColor + "22" : colors.card, borderColor: isSelected ? avatarColor : colors.border, borderWidth: isSelected ? 1.5 : 1 }]}
      activeOpacity={0.75}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {/* Nome + meta */}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>{project.name}</Text>
            {project.folder && (
              <View style={{ backgroundColor: "#6366f118", borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1, borderWidth: 1, borderColor: "#6366f130" }}>
                <Text style={{ color: "#a5b4fc", fontSize: 9, fontWeight: "700" }}>📁 {project.folder}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
            {new Date(project.updatedAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
            {" · "}
            {project.files.length.toLocaleString("pt-BR")} arq.
          </Text>
        </View>

        {/* Menu compacto */}
        <TouchableOpacity
          onPress={showMenu}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", marginLeft: 4 }}
        >
          <Feather name="more-vertical" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
