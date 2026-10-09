function openInEditor(project: Project, editor: "vscode" | "stackblitz" | "gitpod", onPush: () => void) {
  const gitRepo = project.gitRepo;
  if (!gitRepo) {
    Alert.alert(
      "GitHub necessário",
      `Para abrir no ${editor === "vscode" ? "VS Code Web" : editor === "stackblitz" ? "StackBlitz" : "Gitpod"}, primeiro envie o projeto para o GitHub.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "📤 Enviar para GitHub", onPress: onPush },
      ]
    );
    return;
  }
  const match = gitRepo.match(/github\.com\/([^/]+)\/([^/\s]+)/);
  if (!match) {
    Alert.alert("URL inválida", "Não foi possível identificar o repositório GitHub.");
    return;
  }
  const [, owner, repo] = match;
  const repoClean = repo.replace(/\.git$/, "");
  const urls: Record<string, string> = {
    vscode: `https://github.dev/${owner}/${repoClean}`,
    stackblitz: `https://stackblitz.com/github/${owner}/${repoClean}`,
    gitpod: `https://gitpod.io/#https://github.com/${owner}/${repoClean}`,
  };
  Linking.openURL(urls[editor]);
}
