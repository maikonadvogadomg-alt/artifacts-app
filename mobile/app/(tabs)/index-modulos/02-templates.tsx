const TEMPLATES: Record<string, { label: string; icon: string; files: { name: string; content: string }[] }> = {
  vazio: {
    label: "Vazio",
    icon: "box",
    files: [
      { name: "README.md", content: "# Novo Projeto\n\nDescreva seu projeto aqui.\n\n## Instalação\n```bash\nnpm install\n```\n\n## Uso\n```bash\nnpm start\n```\n" },
      { name: ".gitignore", content: "node_modules/\n.env\n.DS_Store\ndist/\nbuild/\n*.log\n" },
    ],
  },
  javascript: {
    label: "JavaScript",
    icon: "code",
    files: [
      { name: "index.js", content: `const fs = require('fs');
const path = require('path');

// Configuração
const config = {
  nome: 'Meu App',
  versao: '1.0.0',
  debug: process.env.NODE_ENV !== 'production',
};

// Utilitários
function formatarData(data = new Date()) {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Classe principal
class App {
  constructor(config) {
    this.config = config;
    this.dados = [];
    this.inicializado = false;
  }

  async inicializar() {
    console.log(\`[\${formatarData()}] Iniciando \${this.config.nome} v\${this.config.versao}\`);
    await sleep(100);
    this.inicializado = true;
    return this;
  }

  adicionar(item) {
    if (!this.inicializado) throw new Error('App não inicializado');
    const registro = { id: Date.now(), ...item, criadoEm: new Date().toISOString() };
    this.dados.push(registro);
    return registro;
  }

  buscar(id) {
    return this.dados.find(d => d.id === id) || null;
  }

  listar(filtro = {}) {
    return this.dados.filter(d =>
      Object.entries(filtro).every(([k, v]) => d[k] === v)
    );
  }

  remover(id) {
    const idx = this.dados.findIndex(d => d.id === id);
    if (idx === -1) return false;
    this.dados.splice(idx, 1);
    return true;
  }

  status() {
    return {
      nome: this.config.nome,
      versao: this.config.versao,
      totalRegistros: this.dados.length,
      inicializado: this.inicializado,
      dataAtual: formatarData(),
    };
  }
}

// Execução
async function main() {
  const app = await new App(config).inicializar();

  app.adicionar({ nome: 'Primeiro Item', tipo: 'exemplo' });
  app.adicionar({ nome: 'Segundo Item', tipo: 'exemplo' });
  app.adicionar({ nome: 'Item Especial', tipo: 'especial' });

  console.log('Todos:', app.listar());
  console.log('Exemplos:', app.listar({ tipo: 'exemplo' }));
  console.log('Status:', app.status());
}

main().catch(console.error);
` },
      { name: "package.json", content: '{\n  "name": "meu-projeto-js",\n  "version": "1.0.0",\n  "description": "Projeto JavaScript",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js",\n    "dev": "nodemon index.js",\n    "test": "node --test"\n  },\n  "dependencies": {},\n  "devDependencies": {\n    "nodemon": "^3.0.0"\n  }\n}\n' },
      { name: ".env", content: "NODE_ENV=development\nPORT=3000\n" },
      { name: ".gitignore", content: "node_modules/\n.env\n*.log\n" },
      { name: "README.md", content: "# Meu Projeto JavaScript\n\n## Instalação\n```bash\nnpm install\n```\n\n## Executar\n```bash\nnpm start\n# ou em modo desenvolvimento:\nnpm run dev\n```\n" },
    ],
  },
  typescript: {
    label: "TypeScript",
    icon: "file-text",
    files: [
      { name: "src/index.ts", content: `import path from 'path';

// Tipos
interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: 'admin' | 'usuario' | 'visitante';
  criadoEm: Date;
}

interface RespostaAPI<T> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
  total?: number;
}

// Repositório genérico
class Repositorio<T extends { id: number }> {
  private items: T[] = [];
  private nextId = 1;

  criar(data: Omit<T, 'id'>): T {
    const item = { ...data, id: this.nextId++ } as T;
    this.items.push(item);
    return item;
  }

  buscarPorId(id: number): T | undefined {
    return this.items.find(i => i.id === id);
  }

  listarTodos(filtro?: Partial<T>): T[] {
    if (!filtro) return [...this.items];
    return this.items.filter(item =>
      Object.entries(filtro).every(([k, v]) => (item as Record<string, unknown>)[k] === v)
    );
  }

  atualizar(id: number, data: Partial<T>): T | null {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this.items[idx] = { ...this.items[idx], ...data };
    return this.items[idx];
  }

  remover(id: number): boolean {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }
}

// Serviço de usuários
class ServicoUsuario {
  private repo = new Repositorio<Usuario>();

  criar(nome: string, email: string, papel: Usuario['papel'] = 'usuario'): RespostaAPI<Usuario> {
    if (!email.includes('@')) {
      return { sucesso: false, erro: 'Email inválido' };
    }
    const usuario = this.repo.criar({ nome, email, papel, criadoEm: new Date() });
    return { sucesso: true, dados: usuario };
  }

  buscar(id: number): RespostaAPI<Usuario> {
    const usuario = this.repo.buscarPorId(id);
    if (!usuario) return { sucesso: false, erro: 'Usuário não encontrado' };
    return { sucesso: true, dados: usuario };
  }

  listar(papel?: Usuario['papel']): RespostaAPI<Usuario[]> {
    const todos = papel ? this.repo.listarTodos({ papel } as Partial<Usuario>) : this.repo.listarTodos();
    return { sucesso: true, dados: todos, total: todos.length };
  }
}

// Main
async function main(): Promise<void> {
  const servico = new ServicoUsuario();

  console.log('=== Sistema de Usuários ===\\n');

  const r1 = servico.criar('João Silva', 'joao@email.com', 'admin');
  const r2 = servico.criar('Maria Souza', 'maria@email.com', 'usuario');
  const r3 = servico.criar('Carlos Lima', 'carlos@email.com', 'usuario');

  console.log('Criados:', [r1, r2, r3].map(r => r.dados?.nome));

  const lista = servico.listar();
  console.log('Total de usuários:', lista.total);
  console.log('Usuários:', lista.dados?.map(u => \`\${u.nome} (\${u.papel})\`));

  const buscado = servico.buscar(1);
  console.log('\\nUsuário ID 1:', buscado.dados);
}

main().catch(console.error);
` },
      { name: "tsconfig.json", content: '{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "commonjs",\n    "lib": ["ES2022"],\n    "strict": true,\n    "esModuleInterop": true,\n    "skipLibCheck": true,\n    "outDir": "./dist",\n    "rootDir": "./src",\n    "resolveJsonModule": true,\n    "declaration": true,\n    "sourceMap": true\n  },\n  "include": ["src/**/*"],\n  "exclude": ["node_modules", "dist"]\n}\n' },
      { name: "package.json", content: '{\n  "name": "meu-projeto-ts",\n  "version": "1.0.0",\n  "scripts": {\n    "build": "tsc",\n    "start": "node dist/index.js",\n    "dev": "ts-node src/index.ts",\n    "watch": "tsc --watch"\n  },\n  "dependencies": {},\n  "devDependencies": {\n    "typescript": "^5.3.0",\n    "ts-node": "^10.9.0",\n    "@types/node": "^20.0.0"\n  }\n}\n' },
      { name: ".gitignore", content: "node_modules/\ndist/\n.env\n*.log\n" },
    ],
  },
  python: {
    label: "Python",
    icon: "terminal",
    files: [
      { name: "main.py", content: `#!/usr/bin/env python3
"""API REST simples com Flask"""

from flask import Flask, jsonify, request, abort
from datetime import datetime
from typing import Optional
import os

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

# "Banco" em memória
usuarios = []
proximo_id = 1

def gerar_id():
    global proximo_id
    id_atual = proximo_id
    proximo_id += 1
    return id_atual

def validar_email(email: str) -> bool:
    return '@' in email and '.' in email.split('@')[-1]

# Rotas
@app.route('/api/saude', methods=['GET'])
def saude():
    return jsonify({
        'status': 'ok',
        'versao': '1.0.0',
        'horario': datetime.now().isoformat()
    })

@app.route('/api/usuarios', methods=['GET'])
def listar_usuarios():
    papel = request.args.get('papel')
    resultado = [u for u in usuarios if not papel or u['papel'] == papel]
    return jsonify({'sucesso': True, 'dados': resultado, 'total': len(resultado)})

@app.route('/api/usuarios/<int:uid>', methods=['GET'])
def buscar_usuario(uid: int):
    usuario = next((u for u in usuarios if u['id'] == uid), None)
    if not usuario:
        abort(404, description='Usuário não encontrado')
    return jsonify({'sucesso': True, 'dados': usuario})

@app.route('/api/usuarios', methods=['POST'])
def criar_usuario():
    dados = request.get_json()
    if not dados or not dados.get('nome') or not dados.get('email'):
        abort(400, description='Nome e email são obrigatórios')
    if not validar_email(dados['email']):
        abort(400, description='Email inválido')
    usuario = {
        'id': gerar_id(),
        'nome': dados['nome'],
        'email': dados['email'],
        'papel': dados.get('papel', 'usuario'),
        'criado_em': datetime.now().isoformat(),
    }
    usuarios.append(usuario)
    return jsonify({'sucesso': True, 'dados': usuario}), 201

@app.route('/api/usuarios/<int:uid>', methods=['PUT'])
def atualizar_usuario(uid: int):
    usuario = next((u for u in usuarios if u['id'] == uid), None)
    if not usuario:
        abort(404, description='Usuário não encontrado')
    dados = request.get_json() or {}
    usuario.update({k: v for k, v in dados.items() if k in ['nome', 'email', 'papel']})
    return jsonify({'sucesso': True, 'dados': usuario})

@app.route('/api/usuarios/<int:uid>', methods=['DELETE'])
def remover_usuario(uid: int):
    global usuarios
    tam = len(usuarios)
    usuarios = [u for u in usuarios if u['id'] != uid]
    if len(usuarios) == tam:
        abort(404, description='Usuário não encontrado')
    return jsonify({'sucesso': True, 'mensagem': 'Usuário removido'})

@app.errorhandler(404)
def nao_encontrado(e):
    return jsonify({'sucesso': False, 'erro': str(e)}), 404

@app.errorhandler(400)
def requisicao_invalida(e):
    return jsonify({'sucesso': False, 'erro': str(e)}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    print(f'Servidor rodando em http://localhost:{port}')
    app.run(host='0.0.0.0', port=port, debug=debug)
` },
      { name: "requirements.txt", content: "flask==3.0.0\npython-dotenv==1.0.0\ngunicorn==21.2.0\n" },
      { name: ".env", content: "FLASK_ENV=development\nPORT=5000\nSECRET_KEY=troque-esta-chave\n" },
      { name: ".gitignore", content: "__pycache__/\n*.pyc\n*.pyo\n.env\nvenv/\n.venv/\n*.egg-info/\ndist/\nbuild/\n" },
      { name: "README.md", content: "# API Python Flask\n\n## Instalação\n```bash\npython -m venv venv\nsource venv/bin/activate  # Linux/Mac\nvenv\\Scripts\\activate     # Windows\npip install -r requirements.txt\n```\n\n## Executar\n```bash\npython main.py\n```\n\n## Endpoints\n- `GET /api/saude` — Status da API\n- `GET /api/usuarios` — Listar usuários\n- `POST /api/usuarios` — Criar usuário\n- `GET /api/usuarios/:id` — Buscar por ID\n- `PUT /api/usuarios/:id` — Atualizar\n- `DELETE /api/usuarios/:id` — Remover\n" },
    ],
  },
  html: {
    label: "HTML/CSS/JS",
    icon: "globe",
    files: [
      { name: "index.html", content: `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meu Site</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="header">
    <nav class="nav">
      <div class="logo">MeuSite</div>
      <ul class="nav-links">
        <li><a href="#inicio">Início</a></li>
        <li><a href="#sobre">Sobre</a></li>
        <li><a href="#contato">Contato</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section id="inicio" class="hero">
      <h1>Bem-vindo ao <span class="destaque">MeuSite</span></h1>
      <p>Uma solução moderna e responsiva para seu negócio.</p>
      <button class="btn-primary" onclick="scrollParaContato()">Fale Conosco</button>
    </section>

    <section id="sobre" class="sobre">
      <h2>Sobre Nós</h2>
      <div class="cards">
        <div class="card">
          <div class="card-icon">🚀</div>
          <h3>Rápido</h3>
          <p>Performance otimizada para melhor experiência.</p>
        </div>
        <div class="card">
          <div class="card-icon">🔒</div>
          <h3>Seguro</h3>
          <p>Dados protegidos com as melhores práticas.</p>
        </div>
        <div class="card">
          <div class="card-icon">📱</div>
          <h3>Responsivo</h3>
          <p>Funciona em qualquer dispositivo.</p>
        </div>
      </div>
    </section>

    <section id="contato" class="contato">
      <h2>Entre em Contato</h2>
      <form id="form-contato" onsubmit="enviarForm(event)">
        <div class="form-group">
          <label for="nome">Nome</label>
          <input type="text" id="nome" placeholder="Seu nome" required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" placeholder="seu@email.com" required>
        </div>
        <div class="form-group">
          <label for="mensagem">Mensagem</label>
          <textarea id="mensagem" rows="4" placeholder="Sua mensagem..." required></textarea>
        </div>
        <button type="submit" class="btn-primary">Enviar</button>
      </form>
      <div id="feedback" class="feedback hidden"></div>
    </section>
  </main>

  <footer class="footer">
    <p>&copy; 2024 MeuSite. Todos os direitos reservados.</p>
  </footer>

  <script src="script.js"></script>
</body>
</html>
` },
      { name: "style.css", content: `* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --text: #1f2937;
  --text-muted: #6b7280;
  --bg: #ffffff;
  --bg-alt: #f9fafb;
  --border: #e5e7eb;
  --radius: 12px;
}

body { font-family: 'Segoe UI', sans-serif; color: var(--text); line-height: 1.6; }

.header { position: fixed; top: 0; width: 100%; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); z-index: 100; }
.nav { max-width: 1100px; margin: 0 auto; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 1.3rem; font-weight: 700; color: var(--primary); }
.nav-links { list-style: none; display: flex; gap: 2rem; }
.nav-links a { text-decoration: none; color: var(--text-muted); font-weight: 500; transition: color 0.2s; }
.nav-links a:hover { color: var(--primary); }

.hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 6rem 2rem 2rem; background: linear-gradient(135deg, #f0f0ff 0%, #fff 60%); }
.hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; margin-bottom: 1rem; }
.destaque { color: var(--primary); }
.hero p { font-size: 1.2rem; color: var(--text-muted); margin-bottom: 2rem; max-width: 500px; }

.btn-primary { background: var(--primary); color: #fff; border: none; padding: 0.9rem 2.2rem; border-radius: var(--radius); font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s, transform 0.1s; }
.btn-primary:hover { background: var(--primary-dark); transform: translateY(-2px); }

.sobre { padding: 5rem 2rem; background: var(--bg-alt); }
.sobre h2, .contato h2 { text-align: center; font-size: 2rem; margin-bottom: 3rem; }
.cards { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
.card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius); padding: 2rem; text-align: center; transition: transform 0.2s, box-shadow 0.2s; }
.card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.card-icon { font-size: 2.5rem; margin-bottom: 1rem; }
.card h3 { font-size: 1.2rem; margin-bottom: 0.5rem; }
.card p { color: var(--text-muted); font-size: 0.95rem; }

.contato { padding: 5rem 2rem; }
form { max-width: 560px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.2rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
label { font-weight: 600; font-size: 0.9rem; }
input, textarea { border: 1px solid var(--border); border-radius: 8px; padding: 0.8rem 1rem; font-size: 1rem; font-family: inherit; transition: border-color 0.2s; }
input:focus, textarea:focus { outline: none; border-color: var(--primary); }
textarea { resize: vertical; }

.feedback { max-width: 560px; margin: 1rem auto 0; padding: 1rem; border-radius: var(--radius); text-align: center; font-weight: 600; }
.feedback.sucesso { background: #d1fae5; color: #065f46; }
.feedback.erro { background: #fee2e2; color: #991b1b; }
.hidden { display: none; }

.footer { background: var(--text); color: #9ca3af; text-align: center; padding: 1.5rem; font-size: 0.9rem; }

@media (max-width: 640px) { .nav-links { display: none; } }
` },
      { name: "script.js", content: `// Smooth scroll para seções
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(link.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
  });
});

function scrollParaContato() {
  document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
}

// Formulário de contato
function enviarForm(e) {
  e.preventDefault();
  const feedback = document.getElementById('feedback');
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const mensagem = document.getElementById('mensagem').value;

  if (!nome || !email || !mensagem) {
    mostrarFeedback('Por favor, preencha todos os campos.', false);
    return;
  }

  // Simula envio
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  setTimeout(() => {
    mostrarFeedback(\`Mensagem enviada com sucesso, \${nome}! Entraremos em contato em breve.\`, true);
    e.target.reset();
    btn.textContent = 'Enviar';
    btn.disabled = false;
  }, 1500);
}

function mostrarFeedback(msg, sucesso) {
  const el = document.getElementById('feedback');
  el.textContent = msg;
  el.className = \`feedback \${sucesso ? 'sucesso' : 'erro'}\`;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(() => { el.className = 'feedback hidden'; }, 5000);
}

// Animação de entrada ao rolar
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.style.opacity = '1';
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card').forEach(el => {
  el.style.opacity = '0';
  el.style.transition = 'opacity 0.5s ease';
  observer.observe(el);
});
` },
    ],
  },
  api_express: {
    label: "API Express",
    icon: "server",
    files: [
      { name: "server.js", content: `const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições
app.use((req, res, next) => {
  console.log(\`[\${new Date().toLocaleTimeString('pt-BR')}] \${req.method} \${req.url}\`);
  next();
});

// Banco em memória
const db = {
  usuarios: [],
  nextId: 1,
};

// Helpers
function criarId() { return db.nextId++; }
function agora() { return new Date().toISOString(); }
function validar(obj, campos) {
  const faltando = campos.filter(c => !obj[c]);
  return faltando.length ? \`Campos obrigatórios: \${faltando.join(', ')}\` : null;
}

// === ROTAS ===

// Saúde
app.get('/api/saude', (req, res) => {
  res.json({ status: 'ok', versao: '1.0.0', timestamp: agora(), usuarios: db.usuarios.length });
});

// Listar usuários
app.get('/api/usuarios', (req, res) => {
  const { papel, busca } = req.query;
  let lista = [...db.usuarios];
  if (papel) lista = lista.filter(u => u.papel === papel);
  if (busca) lista = lista.filter(u =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.email.toLowerCase().includes(busca.toLowerCase())
  );
  res.json({ sucesso: true, dados: lista, total: lista.length });
});

// Buscar por ID
app.get('/api/usuarios/:id', (req, res) => {
  const usuario = db.usuarios.find(u => u.id === +req.params.id);
  if (!usuario) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
  res.json({ sucesso: true, dados: usuario });
});

// Criar usuário
app.post('/api/usuarios', (req, res) => {
  const erro = validar(req.body, ['nome', 'email']);
  if (erro) return res.status(400).json({ sucesso: false, erro });
  if (!req.body.email.includes('@')) return res.status(400).json({ sucesso: false, erro: 'Email inválido' });
  const usuario = {
    id: criarId(),
    nome: req.body.nome,
    email: req.body.email.toLowerCase(),
    papel: req.body.papel || 'usuario',
    ativo: true,
    criadoEm: agora(),
    atualizadoEm: agora(),
  };
  db.usuarios.push(usuario);
  res.status(201).json({ sucesso: true, dados: usuario });
});

// Atualizar
app.put('/api/usuarios/:id', (req, res) => {
  const idx = db.usuarios.findIndex(u => u.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
  const campos = ['nome', 'email', 'papel', 'ativo'];
  campos.forEach(c => { if (req.body[c] !== undefined) db.usuarios[idx][c] = req.body[c]; });
  db.usuarios[idx].atualizadoEm = agora();
  res.json({ sucesso: true, dados: db.usuarios[idx] });
});

// Remover
app.delete('/api/usuarios/:id', (req, res) => {
  const idx = db.usuarios.findIndex(u => u.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
  const removido = db.usuarios.splice(idx, 1)[0];
  res.json({ sucesso: true, mensagem: 'Usuário removido', dados: removido });
});

// 404
app.use((req, res) => {
  res.status(404).json({ sucesso: false, erro: \`Rota \${req.method} \${req.url} não encontrada\` });
});

// Iniciar
app.listen(PORT, () => {
  console.log(\`🚀 API rodando em http://localhost:\${PORT}\`);
  console.log(\`📋 Endpoints disponíveis:\`);
  console.log(\`   GET    /api/saude\`);
  console.log(\`   GET    /api/usuarios\`);
  console.log(\`   GET    /api/usuarios/:id\`);
  console.log(\`   POST   /api/usuarios\`);
  console.log(\`   PUT    /api/usuarios/:id\`);
  console.log(\`   DELETE /api/usuarios/:id\`);
});
` },
      { name: "package.json", content: '{\n  "name": "api-express",\n  "version": "1.0.0",\n  "description": "API REST com Node.js e Express",\n  "main": "server.js",\n  "scripts": {\n    "start": "node server.js",\n    "dev": "nodemon server.js"\n  },\n  "dependencies": {\n    "cors": "^2.8.5",\n    "dotenv": "^16.0.0",\n    "express": "^4.18.0"\n  },\n  "devDependencies": {\n    "nodemon": "^3.0.0"\n  }\n}\n' },
      { name: ".env", content: "PORT=3000\nNODE_ENV=development\nJWT_SECRET=troque-esta-chave-secreta\n" },
      { name: ".gitignore", content: "node_modules/\n.env\n*.log\n" },
    ],
  },
  neon: {
    label: "Neon DB",
    icon: "database",
    files: [
      { name: "index.js", content: `const express = require('express');
const { neon } = require('@neondatabase/serverless');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Conexão com Neon
const sql = neon(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());

// Inicializar tabelas
async function inicializarBanco() {
  await sql\`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(200) NOT NULL,
      email VARCHAR(200) UNIQUE NOT NULL,
      papel VARCHAR(50) DEFAULT 'usuario',
      ativo BOOLEAN DEFAULT TRUE,
      criado_em TIMESTAMP DEFAULT NOW(),
      atualizado_em TIMESTAMP DEFAULT NOW()
    )
  \`;
  await sql\`
    CREATE TABLE IF NOT EXISTS registros (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      titulo VARCHAR(300) NOT NULL,
      conteudo TEXT,
      criado_em TIMESTAMP DEFAULT NOW()
    )
  \`;
  console.log('✅ Banco inicializado com sucesso');
}

// === ROTAS ===

app.get('/api/saude', async (req, res) => {
  try {
    const r = await sql\`SELECT NOW() as agora, version() as versao_pg\`;
    res.json({ status: 'ok', banco: 'Neon PostgreSQL', ...r[0] });
  } catch (e) {
    res.status(500).json({ status: 'erro', detalhe: e.message });
  }
});

// Listar usuários
app.get('/api/usuarios', async (req, res) => {
  try {
    const { papel, busca, pagina = 1, limite = 20 } = req.query;
    const offset = (pagina - 1) * limite;
    let usuarios;
    if (busca) {
      usuarios = await sql\`
        SELECT * FROM usuarios
        WHERE (nome ILIKE ${'$'}{('%' + busca + '%')} OR email ILIKE ${'$'}{('%' + busca + '%')})
        AND (${'$'}{papel} IS NULL OR papel = ${'$'}{papel})
        ORDER BY criado_em DESC LIMIT ${'$'}{limite} OFFSET ${'$'}{offset}
      \`;
    } else {
      usuarios = await sql\`
        SELECT * FROM usuarios
        WHERE (${'$'}{papel || null} IS NULL OR papel = ${'$'}{papel || null})
        ORDER BY criado_em DESC LIMIT ${'$'}{limite} OFFSET ${'$'}{offset}
      \`;
    }
    const [{ total }] = await sql\`SELECT COUNT(*) as total FROM usuarios\`;
    res.json({ sucesso: true, dados: usuarios, total: +total, pagina: +pagina });
  } catch (e) {
    res.status(500).json({ sucesso: false, erro: e.message });
  }
});

// Buscar por ID
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const [usuario] = await sql\`SELECT * FROM usuarios WHERE id = ${'$'}{req.params.id}\`;
    if (!usuario) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
    const registros = await sql\`SELECT * FROM registros WHERE usuario_id = ${'$'}{req.params.id} ORDER BY criado_em DESC\`;
    res.json({ sucesso: true, dados: { ...usuario, registros } });
  } catch (e) {
    res.status(500).json({ sucesso: false, erro: e.message });
  }
});

// Criar usuário
app.post('/api/usuarios', async (req, res) => {
  try {
    const { nome, email, papel = 'usuario' } = req.body;
    if (!nome || !email) return res.status(400).json({ sucesso: false, erro: 'Nome e email obrigatórios' });
    const [usuario] = await sql\`
      INSERT INTO usuarios (nome, email, papel)
      VALUES (${'$'}{nome}, ${'$'}{email.toLowerCase()}, ${'$'}{papel})
      RETURNING *
    \`;
    res.status(201).json({ sucesso: true, dados: usuario });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ sucesso: false, erro: 'Email já cadastrado' });
    res.status(500).json({ sucesso: false, erro: e.message });
  }
});

// Atualizar
app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const { nome, email, papel, ativo } = req.body;
    const [usuario] = await sql\`
      UPDATE usuarios SET
        nome = COALESCE(${'$'}{nome}, nome),
        email = COALESCE(${'$'}{email}, email),
        papel = COALESCE(${'$'}{papel}, papel),
        ativo = COALESCE(${'$'}{ativo}, ativo),
        atualizado_em = NOW()
      WHERE id = ${'$'}{req.params.id}
      RETURNING *
    \`;
    if (!usuario) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
    res.json({ sucesso: true, dados: usuario });
  } catch (e) {
    res.status(500).json({ sucesso: false, erro: e.message });
  }
});

// Remover
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const [removido] = await sql\`DELETE FROM usuarios WHERE id = ${'$'}{req.params.id} RETURNING *\`;
    if (!removido) return res.status(404).json({ sucesso: false, erro: 'Usuário não encontrado' });
    res.json({ sucesso: true, mensagem: 'Removido com sucesso', dados: removido });
  } catch (e) {
    res.status(500).json({ sucesso: false, erro: e.message });
  }
});

// Iniciar
inicializarBanco().then(() => {
  app.listen(PORT, () => {
    console.log(\`🚀 API + Neon DB rodando em http://localhost:\${PORT}\`);
  });
}).catch(e => {
  console.error('❌ Erro ao conectar ao banco:', e.message);
  console.error('Verifique a variável DATABASE_URL no .env');
});
` },
      { name: "package.json", content: '{\n  "name": "api-neon-db",\n  "version": "1.0.0",\n  "description": "API REST com Node.js, Express e Neon PostgreSQL",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js",\n    "dev": "nodemon index.js"\n  },\n  "dependencies": {\n    "@neondatabase/serverless": "^0.9.0",\n    "cors": "^2.8.5",\n    "dotenv": "^16.0.0",\n    "express": "^4.18.0"\n  },\n  "devDependencies": {\n    "nodemon": "^3.0.0"\n  }\n}\n' },
      { name: ".env", content: "# Cole sua connection string do Neon aqui:\n# Acesse: console.neon.tech → seu projeto → Connection string\nDATABASE_URL=postgresql://usuario:senha@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require\n\nPORT=3000\nNODE_ENV=development\n" },
      { name: ".gitignore", content: "node_modules/\n.env\n*.log\n" },
      { name: "README.md", content: "# API com Neon DB (PostgreSQL)\n\n## Configuração do Neon\n\n1. Acesse [console.neon.tech](https://console.neon.tech)\n2. Crie um projeto\n3. Copie a **Connection string**\n4. Cole no arquivo `.env` em `DATABASE_URL=...`\n\n## Instalação\n```bash\nnpm install\n```\n\n## Executar\n```bash\nnpm run dev\n```\n\n## Endpoints\n| Método | Rota | Descrição |\n|--------|------|-----------|\n| GET | /api/saude | Status + versão do banco |\n| GET | /api/usuarios | Listar (suporte a busca e paginação) |\n| GET | /api/usuarios/:id | Buscar com registros |\n| POST | /api/usuarios | Criar usuário |\n| PUT | /api/usuarios/:id | Atualizar |\n| DELETE | /api/usuarios/:id | Remover |\n\n## Testar\n```bash\n# Criar usuário\ncurl -X POST http://localhost:3000/api/usuarios \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"nome\":\"João\",\"email\":\"joao@email.com\"}'\n\n# Listar\ncurl http://localhost:3000/api/usuarios\n```\n" },
    ],
  },
  react: {
    label: "React + Vite",
    icon: "zap",
    files: [
      { name: "index.html", content: '<!DOCTYPE html>\n<html lang="pt-br">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>React App</title>\n</head>\n<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.jsx"></script>\n</body>\n</html>\n' },
      { name: "src/main.jsx", content: "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode><App /></React.StrictMode>\n);\n" },
      { name: "src/App.jsx", content: `import React, { useState, useEffect, useCallback } from 'react';

// Hook customizado para dados
function useLocalStorage(chave, valorInicial) {
  const [valor, setValor] = useState(() => {
    try { return JSON.parse(localStorage.getItem(chave)) ?? valorInicial; }
    catch { return valorInicial; }
  });
  const salvar = useCallback(novoValor => {
    setValor(novoValor);
    localStorage.setItem(chave, JSON.stringify(novoValor));
  }, [chave]);
  return [valor, salvar];
}

// Componente de tarefa
function CartaoTarefa({ tarefa, onConcluir, onRemover }) {
  return (
    <div className={\`card \${tarefa.concluida ? 'concluida' : ''}\`}>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={tarefa.concluida}
          onChange={() => onConcluir(tarefa.id)}
        />
        <span className="texto">{tarefa.texto}</span>
      </label>
      <div className="card-footer">
        <span className="data">{new Date(tarefa.criadaEm).toLocaleDateString('pt-BR')}</span>
        <button onClick={() => onRemover(tarefa.id)} className="btn-remover">✕</button>
      </div>
    </div>
  );
}

// App principal
export default function App() {
  const [tarefas, setTarefas] = useLocalStorage('tarefas', []);
  const [input, setInput] = useState('');
  const [filtro, setFiltro] = useState('todas');

  const adicionar = () => {
    if (!input.trim()) return;
    setTarefas([...tarefas, {
      id: Date.now(),
      texto: input.trim(),
      concluida: false,
      criadaEm: new Date().toISOString(),
    }]);
    setInput('');
  };

  const concluir = id => setTarefas(tarefas.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t));
  const remover = id => setTarefas(tarefas.filter(t => t.id !== id));
  const limparConcluidas = () => setTarefas(tarefas.filter(t => !t.concluida));

  const tarefasFiltradas = tarefas.filter(t =>
    filtro === 'todas' ? true : filtro === 'ativas' ? !t.concluida : t.concluida
  );
  const pendentes = tarefas.filter(t => !t.concluida).length;

  return (
    <div className="app">
      <header>
        <h1>📋 Minhas Tarefas</h1>
        <p>{pendentes} pendente{pendentes !== 1 ? 's' : ''} de {tarefas.length}</p>
      </header>

      <div className="input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && adicionar()}
          placeholder="Nova tarefa..."
          autoFocus
        />
        <button onClick={adicionar} disabled={!input.trim()}>Adicionar</button>
      </div>

      <div className="filtros">
        {['todas', 'ativas', 'concluídas'].map(f => (
          <button key={f} onClick={() => setFiltro(f === 'concluídas' ? 'concluidas' : f)}
            className={filtro === (f === 'concluídas' ? 'concluidas' : f) ? 'ativo' : ''}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="lista">
        {tarefasFiltradas.length === 0
          ? <p className="vazio">Nenhuma tarefa aqui.</p>
          : tarefasFiltradas.map(t => (
              <CartaoTarefa key={t.id} tarefa={t} onConcluir={concluir} onRemover={remover} />
            ))
        }
      </div>

      {tarefas.some(t => t.concluida) && (
        <button onClick={limparConcluidas} className="btn-limpar">
          Limpar concluídas ({tarefas.filter(t => t.concluida).length})
        </button>
      )}
    </div>
  );
}
` },
      { name: "src/index.css", content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: #f3f4f6; color: #1f2937; min-height: 100vh; }
.app { max-width: 600px; margin: 0 auto; padding: 2rem 1rem; }
header { text-align: center; margin-bottom: 2rem; }
header h1 { font-size: 2rem; margin-bottom: 0.3rem; }
header p { color: #6b7280; }
.input-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.input-row input { flex: 1; padding: 0.8rem 1rem; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 1rem; transition: border-color 0.2s; }
.input-row input:focus { outline: none; border-color: #6366f1; }
.input-row button { padding: 0.8rem 1.5rem; background: #6366f1; color: #fff; border: none; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.input-row button:hover:not(:disabled) { background: #4f46e5; }
.input-row button:disabled { opacity: 0.5; cursor: not-allowed; }
.filtros { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.filtros button { flex: 1; padding: 0.5rem; border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
.filtros button.ativo { background: #6366f1; color: #fff; border-color: #6366f1; }
.lista { display: flex; flex-direction: column; gap: 0.7rem; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; transition: all 0.2s; }
.card.concluida { opacity: 0.6; }
.checkbox-label { display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; }
.checkbox-label input[type="checkbox"] { width: 18px; height: 18px; margin-top: 2px; accent-color: #6366f1; flex-shrink: 0; }
.texto { font-size: 1rem; line-height: 1.4; }
.concluida .texto { text-decoration: line-through; color: #9ca3af; }
.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #f3f4f6; }
.data { font-size: 0.8rem; color: #9ca3af; }
.btn-remover { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1rem; padding: 2px 6px; border-radius: 4px; }
.btn-remover:hover { background: #fee2e2; }
.vazio { text-align: center; color: #9ca3af; padding: 2rem; }
.btn-limpar { width: 100%; margin-top: 1rem; padding: 0.7rem; background: none; border: 1px solid #e5e7eb; border-radius: 8px; color: #6b7280; cursor: pointer; transition: all 0.2s; }
.btn-limpar:hover { background: #fee2e2; color: #ef4444; border-color: #ef4444; }
` },
      { name: "package.json", content: '{\n  "name": "react-vite-app",\n  "version": "0.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^18.3.0",\n    "react-dom": "^18.3.0"\n  },\n  "devDependencies": {\n    "@vitejs/plugin-react": "^4.2.0",\n    "vite": "^5.0.0"\n  }\n}\n' },
      { name: "vite.config.js", content: "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n" },
    ],
  },
  flask_api: {
    label: "Flask API",
    icon: "activity",
    files: [
      { name: "app.py", content: `from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

# ---- Banco de dados em memória (substitua por PostgreSQL/SQLite) ----
db = []
next_id = [1]

@app.route("/api/saude", methods=["GET"])
def saude():
    return jsonify({"status": "ok", "versao": "1.0.0"})

@app.route("/api/itens", methods=["GET"])
def listar():
    return jsonify(db)

@app.route("/api/itens", methods=["POST"])
def criar():
    dados = request.get_json()
    if not dados or "nome" not in dados:
        return jsonify({"erro": "Campo 'nome' obrigatório"}), 400
    item = {"id": next_id[0], **dados}
    next_id[0] += 1
    db.append(item)
    return jsonify(item), 201

@app.route("/api/itens/<int:item_id>", methods=["GET"])
def buscar(item_id):
    item = next((i for i in db if i["id"] == item_id), None)
    return jsonify(item) if item else (jsonify({"erro": "Não encontrado"}), 404)

@app.route("/api/itens/<int:item_id>", methods=["PUT"])
def atualizar(item_id):
    item = next((i for i in db if i["id"] == item_id), None)
    if not item:
        return jsonify({"erro": "Não encontrado"}), 404
    item.update(request.get_json())
    return jsonify(item)

@app.route("/api/itens/<int:item_id>", methods=["DELETE"])
def remover(item_id):
    global db
    db = [i for i in db if i["id"] != item_id]
    return jsonify({"ok": True})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
` },
      { name: "requirements.txt", content: "flask==3.0.0\nflask-cors==4.0.0\npython-dotenv==1.0.0\ngunicorn==21.2.0\n" },
      { name: ".env", content: "PORT=5000\nFLASK_ENV=development\nDATABASE_URL=postgresql://usuario:senha@host/banco\n" },
      { name: "README.md", content: "# API Flask\n\n## Instalar\n```bash\npip install -r requirements.txt\n```\n\n## Rodar\n```bash\npython app.py\n```\n\n## Endpoints\n- `GET /api/saude` — Status\n- `GET /api/itens` — Listar\n- `POST /api/itens` — Criar\n- `PUT /api/itens/:id` — Atualizar\n- `DELETE /api/itens/:id` — Remover\n" },
    ],
  },
  fastapi: {
    label: "FastAPI",
    icon: "zap",
    files: [
      { name: "main.py", content: `from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os

app = FastAPI(title="Minha API FastAPI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Modelos ----
class Item(BaseModel):
    nome: str
    descricao: Optional[str] = None
    preco: float = 0.0

class ItemResposta(Item):
    id: int

# ---- Banco em memória ----
db: List[ItemResposta] = []
contador = 0

@app.get("/")
def raiz():
    return {"mensagem": "API FastAPI rodando!", "docs": "/docs"}

@app.get("/api/itens", response_model=List[ItemResposta])
def listar_itens():
    return db

@app.post("/api/itens", response_model=ItemResposta, status_code=201)
def criar_item(item: Item):
    global contador
    contador += 1
    novo = ItemResposta(id=contador, **item.dict())
    db.append(novo)
    return novo

@app.get("/api/itens/{item_id}", response_model=ItemResposta)
def buscar_item(item_id: int):
    for item in db:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item não encontrado")

@app.delete("/api/itens/{item_id}")
def remover_item(item_id: int):
    global db
    db = [i for i in db if i.id != item_id]
    return {"ok": True}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
` },
      { name: "requirements.txt", content: "fastapi==0.110.0\nuvicorn[standard]==0.27.0\npython-dotenv==1.0.0\npydantic==2.6.0\n" },
      { name: ".env", content: "PORT=8000\nDATABASE_URL=postgresql://usuario:senha@host/banco\n" },
      { name: "README.md", content: "# API FastAPI\n\n## Instalar\n```bash\npip install -r requirements.txt\n```\n\n## Rodar\n```bash\nuvicorn main:app --reload\n```\n\nDocumentação automática: `http://localhost:8000/docs`\n" },
    ],
  },
  telegram_bot: {
    label: "Bot Telegram",
    icon: "send",
    files: [
      { name: "bot.py", content: `import os
import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO)

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

# ---- Handlers ----
async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        f"Olá, {update.effective_user.first_name}! 👋\\n\\n"
        "Eu sou seu bot assistente.\\n"
        "/ajuda — ver todos os comandos"
    )

async def ajuda(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📋 Comandos disponíveis:\\n"
        "/start — Iniciar\\n"
        "/ajuda — Esta mensagem\\n"
        "/info — Informações do chat"
    )

async def info(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    chat = update.effective_chat
    await update.message.reply_text(
        f"ℹ️ Info do chat:\\n"
        f"ID: {chat.id}\\n"
        f"Tipo: {chat.type}\\n"
        f"Título: {chat.title or 'N/A'}"
    )

async def mensagem(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    texto = update.message.text
    await update.message.reply_text(f"Você disse: {texto}\\n\\nUse /ajuda para ver comandos.")

def main():
    if not TOKEN:
        raise ValueError("Configure TELEGRAM_BOT_TOKEN no arquivo .env")
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("ajuda", ajuda))
    app.add_handler(CommandHandler("info", info))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, mensagem))
    print("🤖 Bot iniciado! Pressione Ctrl+C para parar.")
    app.run_polling()

if __name__ == "__main__":
    main()
` },
      { name: "requirements.txt", content: "python-telegram-bot==20.8\npython-dotenv==1.0.0\n" },
      { name: ".env", content: "# Obtenha o token com @BotFather no Telegram\nTELEGRAM_BOT_TOKEN=seu-token-aqui\n" },
      { name: "README.md", content: "# Bot Telegram em Python\n\n## Configuração\n1. Crie um bot com @BotFather no Telegram\n2. Copie o token para o `.env`\n\n## Instalar\n```bash\npip install -r requirements.txt\n```\n\n## Rodar\n```bash\npython bot.py\n```\n" },
    ],
  },
  landing_page: {
    label: "Landing Page",
    icon: "layout",
    files: [
      { name: "index.html", content: `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minha Landing Page</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root { --primario: #7c3aed; --texto: #1f2937; --fundo: #f9fafb; }
    body { font-family: 'Segoe UI', sans-serif; color: var(--texto); background: var(--fundo); }
    nav { background: #fff; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 10; }
    .logo { font-size: 1.4rem; font-weight: 800; color: var(--primario); }
    nav ul { list-style: none; display: flex; gap: 2rem; }
    nav a { text-decoration: none; color: var(--texto); font-weight: 500; }
    .hero { min-height: 90vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4rem 2rem; background: linear-gradient(135deg, #ede9fe 0%, #f0fdf4 100%); }
    .hero h1 { font-size: clamp(2rem, 6vw, 4rem); font-weight: 900; color: var(--primario); margin-bottom: 1.5rem; line-height: 1.1; }
    .hero p { font-size: 1.2rem; color: #6b7280; max-width: 600px; margin: 0 auto 2.5rem; }
    .btn { display: inline-block; padding: 1rem 2.5rem; background: var(--primario); color: #fff; border-radius: 50px; font-weight: 700; font-size: 1.1rem; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; }
    .btn:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(124,58,237,0.4); }
    .features { padding: 5rem 2rem; max-width: 1100px; margin: 0 auto; }
    .features h2 { text-align: center; font-size: 2rem; font-weight: 800; margin-bottom: 3rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
    .card { background: #fff; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .card h3 { font-size: 1.2rem; margin-bottom: 0.5rem; }
    .card p { color: #6b7280; line-height: 1.6; }
    footer { background: #111827; color: #9ca3af; text-align: center; padding: 2rem; }
    footer a { color: var(--primario); text-decoration: none; }
  </style>
</head>
<body>
  <nav>
    <div class="logo">MeuProduto</div>
    <ul>
      <li><a href="#features">Recursos</a></li>
      <li><a href="#contato">Contato</a></li>
    </ul>
  </nav>
  <section class="hero">
    <div>
      <h1>A solução que você<br>sempre quis</h1>
      <p>Simplifique sua vida com nossa plataforma poderosa. Rápido, seguro e intuitivo.</p>
      <a href="#features" class="btn">Começar grátis →</a>
    </div>
  </section>
  <section class="features" id="features">
    <h2>Por que nos escolher?</h2>
    <div class="grid">
      <div class="card"><div class="icon">⚡</div><h3>Ultra Rápido</h3><p>Performance de ponta para você não perder tempo.</p></div>
      <div class="card"><div class="icon">🔒</div><h3>Seguro</h3><p>Seus dados protegidos com criptografia de nível militar.</p></div>
      <div class="card"><div class="icon">📱</div><h3>Responsivo</h3><p>Funciona perfeitamente em qualquer dispositivo.</p></div>
    </div>
  </section>
  <footer id="contato"><p>© 2025 MeuProduto. Feito com ❤️ no Brasil.</p></footer>
</body>
</html>
` },
    ],
  },
  cli_node: {
    label: "CLI Node.js",
    icon: "terminal",
    files: [
      { name: "cli.js", content: `#!/usr/bin/env node
'use strict';
const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const pkg = require('./package.json');

const program = new Command();

program
  .name('minha-cli')
  .description('Ferramenta de linha de comando em Node.js')
  .version(pkg.version);

// Comando: saudar
program
  .command('ola <nome>')
  .description('Sauda alguém pelo nome')
  .option('-m, --maiusculo', 'Exibe em maiúsculas')
  .action((nome, opts) => {
    const msg = opts.maiusculo ? nome.toUpperCase() : nome;
    console.log(chalk.green(\`Olá, \${msg}! 👋\`));
  });

// Comando: listar
program
  .command('listar')
  .description('Lista itens de exemplo')
  .option('-j, --json', 'Saída em JSON')
  .action(async (opts) => {
    const spinner = ora('Carregando...').start();
    await new Promise(r => setTimeout(r, 800));
    spinner.succeed('Feito!');
    const itens = [
      { id: 1, nome: 'Item A', status: 'ativo' },
      { id: 2, nome: 'Item B', status: 'inativo' },
      { id: 3, nome: 'Item C', status: 'ativo' },
    ];
    if (opts.json) {
      console.log(JSON.stringify(itens, null, 2));
    } else {
      itens.forEach(i =>
        console.log(\`  \${chalk.cyan(i.id)} \${chalk.bold(i.nome)} — \${i.status === 'ativo' ? chalk.green(i.status) : chalk.red(i.status)}\`)
      );
    }
  });

// Comando: info
program
  .command('info')
  .description('Mostra informações do sistema')
  .action(() => {
    console.log(chalk.bold('\\n📋 Informações do Sistema'));
    console.log(\`  Node.js : \${chalk.cyan(process.version)}\`);
    console.log(\`  Plataforma: \${chalk.cyan(process.platform)}\`);
    console.log(\`  Diretório : \${chalk.cyan(process.cwd())}\\n\`);
  });

program.parse(process.argv);
` },
      { name: "package.json", content: '{\n  "name": "minha-cli",\n  "version": "1.0.0",\n  "description": "CLI em Node.js",\n  "bin": { "minha-cli": "./cli.js" },\n  "scripts": { "start": "node cli.js", "dev": "node cli.js --help" },\n  "dependencies": { "commander": "^12.0.0", "chalk": "^4.1.2", "ora": "^5.4.1" }\n}\n' },
      { name: "README.md", content: "# CLI Node.js\n\n## Instalar dependências\n```bash\nnpm install\n```\n\n## Usar\n```bash\nnode cli.js ola Mundo\nnode cli.js listar\nnode cli.js listar --json\nnode cli.js info\n```\n" },
    ],
  },
  discord_bot: {
    label: "Bot Discord",
    icon: "message-circle",
    files: [
      { name: "bot.js", content: `const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// ---- Slash Commands ----
const comandos = [
  new SlashCommandBuilder().setName('ping').setDescription('Verifica latência do bot'),
  new SlashCommandBuilder().setName('ola').setDescription('Sauda o usuário'),
  new SlashCommandBuilder().setName('info').setDescription('Info do servidor'),
].map(c => c.toJSON());

// Registrar comandos ao iniciar
client.once('ready', async () => {
  console.log(\`✅ Bot online: \${client.user.tag}\`);
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: comandos });
    console.log('📋 Slash commands registrados!');
  } catch (e) { console.error(e); }
});

// Handler de interações
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'ping') {
    await interaction.reply({ content: \`🏓 Pong! Latência: \${client.ws.ping}ms\`, ephemeral: true });
  }
  if (interaction.commandName === 'ola') {
    const embed = new EmbedBuilder()
      .setColor('#7c3aed')
      .setTitle(\`Olá, \${interaction.user.displayName}! 👋\`)
      .setDescription('Bem-vindo ao servidor!')
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
  if (interaction.commandName === 'info') {
    const guild = interaction.guild;
    const embed = new EmbedBuilder()
      .setColor('#3b82f6')
      .setTitle(guild.name)
      .addFields(
        { name: 'Membros', value: String(guild.memberCount), inline: true },
        { name: 'Criado em', value: guild.createdAt.toLocaleDateString('pt-BR'), inline: true },
      );
    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
` },
      { name: "package.json", content: '{\n  "name": "discord-bot",\n  "version": "1.0.0",\n  "main": "bot.js",\n  "scripts": { "start": "node bot.js", "dev": "nodemon bot.js" },\n  "dependencies": { "discord.js": "^14.14.0", "dotenv": "^16.0.0" },\n  "devDependencies": { "nodemon": "^3.0.0" }\n}\n' },
      { name: ".env", content: "# Obtenha em discord.com/developers/applications\nDISCORD_TOKEN=seu-token-aqui\n" },
      { name: "README.md", content: "# Bot Discord em Node.js\n\n## Configuração\n1. Crie um app em discord.com/developers/applications\n2. Copie o token para o `.env`\n\n## Instalar\n```bash\nnpm install\n```\n\n## Rodar\n```bash\nnode bot.js\n```\n" },
    ],
  },
  vue_cdn: {
    label: "Vue.js CDN",
    icon: "triangle",
    files: [
      { name: "index.html", content: `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Vue.js</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"><\/script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #f1f5f9; min-height: 100vh; padding: 2rem; }
    #app { max-width: 700px; margin: 0 auto; }
    h1 { color: #42b883; font-size: 2rem; margin-bottom: 0.5rem; }
    .subtitulo { color: #6b7280; margin-bottom: 2rem; }
    .input-row { display: flex; gap: 10px; margin-bottom: 1.5rem; }
    input { flex: 1; padding: 0.75rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; outline: none; transition: border 0.2s; }
    input:focus { border-color: #42b883; }
    button { padding: 0.75rem 1.5rem; background: #42b883; color: #fff; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 1rem; }
    button:hover { background: #35a46e; }
    .lista { display: flex; flex-direction: column; gap: 10px; }
    .item { background: #fff; border-radius: 12px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .check { width: 22px; height: 22px; accent-color: #42b883; cursor: pointer; }
    .texto { flex: 1; font-size: 1rem; }
    .texto.feito { text-decoration: line-through; color: #9ca3af; }
    .del { background: none; border: none; cursor: pointer; color: #ef4444; font-size: 1.2rem; padding: 0; }
    .contagem { text-align: center; color: #6b7280; margin-top: 1.5rem; font-size: 0.9rem; }
  </style>
</head>
<body>
<div id="app">
  <h1>✅ Lista de Tarefas</h1>
  <p class="subtitulo">Feito com Vue.js 3 (CDN)</p>
  <div class="input-row">
    <input v-model="nova" @keyup.enter="adicionar" placeholder="Nova tarefa..." />
    <button @click="adicionar">Adicionar</button>
  </div>
  <div class="lista">
    <div class="item" v-for="(t, i) in tarefas" :key="t.id">
      <input type="checkbox" class="check" v-model="t.feita" />
      <span class="texto" :class="{ feito: t.feita }">{{ t.texto }}</span>
      <button class="del" @click="remover(i)">🗑</button>
    </div>
    <p v-if="tarefas.length === 0" style="text-align:center;color:#9ca3af;padding:2rem;">Nenhuma tarefa. Adicione uma acima!</p>
  </div>
  <p class="contagem" v-if="tarefas.length > 0">{{ pendentes }} de {{ tarefas.length }} tarefas pendentes</p>
</div>
<script>
const { createApp } = Vue;
createApp({
  data() {
    return { nova: '', tarefas: [{ id: 1, texto: 'Aprender Vue.js 3', feita: false }, { id: 2, texto: 'Criar meu app', feita: false }] };
  },
  computed: { pendentes() { return this.tarefas.filter(t => !t.feita).length; } },
  methods: {
    adicionar() {
      const texto = this.nova.trim();
      if (!texto) return;
      this.tarefas.push({ id: Date.now(), texto, feita: false });
      this.nova = '';
    },
    remover(i) { this.tarefas.splice(i, 1); },
  }
}).mount('#app');
<\/script>
</body>
</html>
` },
    ],
  },
  shell: {
    label: "Shell Script",
    icon: "terminal",
    files: [
      { name: "script.sh", content: `#!/bin/bash
# Script de automação em Bash
set -euo pipefail

# Cores para output
VERDE='\\033[0;32m'
AMARELO='\\033[1;33m'
VERMELHO='\\033[0;31m'
SEM_COR='\\033[0m'

log() { echo -e "\${VERDE}[OK]\${SEM_COR} $1"; }
aviso() { echo -e "\${AMARELO}[AVISO]\${SEM_COR} $1"; }
erro() { echo -e "\${VERMELHO}[ERRO]\${SEM_COR} $1"; exit 1; }

# Verifica dependências
checar_deps() {
  local deps=("git" "node" "npm")
  for dep in "\${deps[@]}"; do
    command -v "$dep" &>/dev/null || erro "Dependência não encontrada: $dep"
    log "$dep: OK"
  done
}

# Backup de arquivos
fazer_backup() {
  local src="$1"
  local dest="backup_\$(date +%Y%m%d_%H%M%S)"
  [ -d "$src" ] || erro "Diretório não encontrado: $src"
  cp -r "$src" "$dest"
  log "Backup criado em: $dest"
}

# Menu interativo
menu() {
  echo "============================"
  echo " Menu Principal"
  echo "============================"
  echo "1) Verificar dependências"
  echo "2) Fazer backup"
  echo "3) Listar arquivos"
  echo "0) Sair"
  read -rp "Escolha: " opcao
  case $opcao in
    1) checar_deps ;;
    2) read -rp "Diretório para backup: " dir; fazer_backup "$dir" ;;
    3) ls -la ;;
    0) log "Saindo..."; exit 0 ;;
    *) aviso "Opção inválida" ;;
  esac
}

main() {
  log "Iniciando script..."
  while true; do menu; done
}

main "$@"
` },
      { name: "README.md", content: "# Shell Script\n\n## Executar\n```bash\nchmod +x script.sh\n./script.sh\n```\n" },
    ],
  },
  react_native: {
    label: "React Native",
    icon: "smartphone",
    files: [
      { name: "App.tsx", content: `import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  FlatList, TextInput, Alert, StatusBar,
} from 'react-native';

interface Item {
  id: string;
  texto: string;
  feito: boolean;
}

export default function App() {
  const [itens, setItens] = useState<Item[]>([]);
  const [texto, setTexto] = useState('');

  const adicionar = () => {
    const t = texto.trim();
    if (!t) return;
    setItens(prev => [...prev, { id: Date.now().toString(), texto: t, feito: false }]);
    setTexto('');
  };

  const alternar = (id: string) =>
    setItens(prev => prev.map(i => i.id === id ? { ...i, feito: !i.feito } : i));

  const remover = (id: string) =>
    Alert.alert('Remover', 'Tem certeza?', [
      { text: 'Cancelar' },
      { text: 'Remover', style: 'destructive', onPress: () => setItens(prev => prev.filter(i => i.id !== id)) },
    ]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <Text style={styles.titulo}>📝 Lista de Tarefas</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={texto}
          onChangeText={setTexto}
          placeholder="Nova tarefa..."
          placeholderTextColor="#888"
          onSubmitEditing={adicionar}
        />
        <TouchableOpacity style={styles.btnAdd} onPress={adicionar}>
          <Text style={styles.btnAddTxt}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={itens}
        keyExtractor={i => i.id}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma tarefa ainda!</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => alternar(item.id)} onLongPress={() => remover(item.id)}>
            <Text style={[styles.itemTxt, item.feito && styles.feito]}>{item.feito ? '✅' : '⬜'} {item.texto}</Text>
          </TouchableOpacity>
        )}
      />
      <Text style={styles.rodape}>Segure para remover • Toque para marcar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 60, paddingHorizontal: 20 },
  titulo: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 24, textAlign: 'center' },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#16213e', color: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, borderWidth: 1, borderColor: '#0f3460' },
  btnAdd: { backgroundColor: '#6366f1', width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnAddTxt: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  item: { backgroundColor: '#16213e', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#0f3460' },
  itemTxt: { color: '#e2e8f0', fontSize: 16 },
  feito: { textDecorationLine: 'line-through', color: '#64748b' },
  vazio: { color: '#64748b', textAlign: 'center', marginTop: 60, fontSize: 16 },
  rodape: { color: '#475569', textAlign: 'center', fontSize: 12, paddingVertical: 16 },
});
` },
      { name: "package.json", content: '{\n  "name": "meu-app-rn",\n  "version": "1.0.0",\n  "main": "node_modules/expo/AppEntry.js",\n  "scripts": {\n    "start": "expo start",\n    "android": "expo run:android",\n    "ios": "expo run:ios"\n  },\n  "dependencies": {\n    "expo": "~54.0.0",\n    "react": "18.3.2",\n    "react-native": "0.76.7"\n  }\n}\n' },
      { name: "app.json", content: '{\n  "expo": {\n    "name": "MeuApp",\n    "slug": "meu-app",\n    "version": "1.0.0",\n    "orientation": "portrait",\n    "userInterfaceStyle": "dark"\n  }\n}\n' },
    ],
  },
  pwa: {
    label: "PWA",
    icon: "globe",
    files: [
      { name: "index.html", content: `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, standalone">
  <meta name="theme-color" content="#6366f1">
  <meta name="description" content="Meu Progressive Web App">
  <link rel="manifest" href="manifest.json">
  <title>Meu PWA</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
    .card { background: #1e293b; border-radius: 20px; padding: 40px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
    h1 { font-size: 2rem; margin-bottom: 10px; }
    p { color: #94a3b8; margin-bottom: 30px; }
    .status { background: #0f172a; border-radius: 12px; padding: 15px; margin-bottom: 20px; font-size: 0.9rem; color: #64748b; }
    .btn { background: #6366f1; color: #fff; border: none; padding: 14px 28px; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; width: 100%; }
    .btn:hover { background: #4f46e5; }
    .offline { display: none; background: #dc2626; color: #fff; padding: 10px; border-radius: 8px; margin-top: 15px; font-size: 0.9rem; }
    .online { display: none; background: #16a34a; color: #fff; padding: 10px; border-radius: 8px; margin-top: 15px; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Meu PWA</h1>
    <p>Progressive Web App instalável</p>
    <div class="status" id="status">Verificando conexão...</div>
    <button class="btn" onclick="instalar()">📲 Instalar App</button>
    <div class="offline" id="offline">⚠️ Sem conexão — modo offline</div>
    <div class="online" id="online">✅ Conectado!</div>
  </div>
  <script>
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredPrompt = e;
    });
    async function instalar() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        document.getElementById('status').textContent = outcome === 'accepted' ? 'App instalado!' : 'Instalação cancelada';
      } else {
        alert('Para instalar: menu do navegador → "Adicionar à tela inicial"');
      }
    }
    function atualizarStatus() {
      const online = navigator.onLine;
      document.getElementById('status').textContent = online ? '🟢 Online' : '🔴 Offline';
      document.getElementById('offline').style.display = online ? 'none' : 'block';
      document.getElementById('online').style.display = online ? 'block' : 'none';
    }
    window.addEventListener('online', atualizarStatus);
    window.addEventListener('offline', atualizarStatus);
    atualizarStatus();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => console.log('SW registrado'));
    }
  </script>
</body>
</html>
` },
      { name: "manifest.json", content: '{\n  "name": "Meu PWA",\n  "short_name": "MeuPWA",\n  "description": "Progressive Web App",\n  "start_url": "/",\n  "display": "standalone",\n  "background_color": "#0f172a",\n  "theme_color": "#6366f1",\n  "orientation": "portrait",\n  "icons": [\n    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },\n    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }\n  ]\n}\n' },
      { name: "sw.js", content: `const CACHE = 'meu-pwa-v1';
const ARQUIVOS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
` },
    ],
  },
  sql: {
    label: "SQL / Banco",
    icon: "database",
    files: [
      { name: "schema.sql", content: `-- Schema do banco de dados
-- Compatível com PostgreSQL, MySQL e SQLite

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id         SERIAL PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  papel      VARCHAR(20)  NOT NULL DEFAULT 'usuario' CHECK (papel IN ('admin', 'usuario', 'visitante')),
  ativo      BOOLEAN      NOT NULL DEFAULT TRUE,
  criado_em  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
  id           SERIAL PRIMARY KEY,
  categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  nome         VARCHAR(200) NOT NULL,
  descricao    TEXT,
  preco        DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
  estoque      INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  ativo        BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id          SERIAL PRIMARY KEY,
  usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'enviado', 'entregue', 'cancelado')),
  total       DECIMAL(10,2) NOT NULL DEFAULT 0,
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Itens do pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
  id          SERIAL PRIMARY KEY,
  pedido_id   INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id  INTEGER REFERENCES produtos(id) ON DELETE RESTRICT,
  quantidade  INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unit  DECIMAL(10,2) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email   ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_produtos_cat     ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario  ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status   ON pedidos(status);
` },
      { name: "queries.sql", content: `-- Consultas úteis

-- Buscar todos os usuários ativos
SELECT id, nome, email, papel, criado_em FROM usuarios WHERE ativo = TRUE ORDER BY nome;

-- Produtos com estoque baixo (menos de 10)
SELECT p.nome, p.estoque, c.nome AS categoria
FROM produtos p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.ativo = TRUE AND p.estoque < 10
ORDER BY p.estoque ASC;

-- Pedidos com total por usuário
SELECT u.nome, COUNT(p.id) AS total_pedidos, SUM(p.total) AS valor_total
FROM usuarios u
JOIN pedidos p ON p.usuario_id = u.id
GROUP BY u.id, u.nome
ORDER BY valor_total DESC;

-- Últimos 30 dias de vendas
SELECT DATE(criado_em) AS dia, COUNT(*) AS pedidos, SUM(total) AS receita
FROM pedidos
WHERE criado_em >= NOW() - INTERVAL '30 days' AND status = 'pago'
GROUP BY DATE(criado_em)
ORDER BY dia DESC;

-- Inserir dados de exemplo
INSERT INTO categorias (nome, descricao) VALUES
  ('Eletrônicos', 'Dispositivos e gadgets'),
  ('Livros', 'Livros físicos e digitais'),
  ('Roupas', 'Vestuário em geral');

INSERT INTO produtos (categoria_id, nome, preco, estoque) VALUES
  (1, 'Fone Bluetooth', 149.90, 50),
  (1, 'Carregador USB-C', 49.90, 100),
  (2, 'Clean Code', 89.90, 30),
  (3, 'Camiseta Básica', 59.90, 200);
` },
      { name: "README.md", content: "# Banco de Dados SQL\n\n## Executar\n```bash\n# PostgreSQL\npsql -U postgres -d meu_banco -f schema.sql\npsql -U postgres -d meu_banco -f queries.sql\n\n# SQLite\nsqlite3 banco.db < schema.sql\nsqlite3 banco.db < queries.sql\n```\n" },
    ],
  },

  manual: {
    label: "📖 Manual AppIDE",
    icon: "book-open",
    files: [
      { name: "MANUAL.md", content: `# 📖 Manual AppIDE v2.9.0

## Índice
1. O que é o AppIDE?
2. Editor de Código
3. Terminal Linux
4. IA — Jasmim
5. GitHub — Clone e Push
6. Playground HTML
7. Extrator de Sites
8. Importar / Exportar
9. Plugins e Linguagens
10. Banco de Dados
11. Modo Termux (offline)
12. Preparar APK
13. Problemas Comuns

---

## 1. O que é o AppIDE?
IDE profissional para Android — 100% independente, sem servidor externo obrigatório.
Editor Monaco (igual ao VS Code), terminal Linux, IA (Jasmim), GitHub, banco de dados e plugins, tudo no celular.

---

## 2. Editor de Código
- Aba **Editor** (ícone </> na barra inferior)
- Syntax highlight para JS, TS, Python, HTML, CSS, JSON, e mais
- Botão ▶ roda o arquivo atual
- Menu ☰ abre: árvore de arquivos, GitHub, importar/exportar, database

---

## 3. Terminal Linux
Aba **Terminal** (ícone >_ na barra inferior)

### Opções de terminal (sem servidor, no navegador):
| Terminal | Tipo | Como acessar |
|----------|------|-------------|
| 🟢 WebVM | Alpine Linux via WebAssembly | webvm.io |
| 💾 Copy.sh v86 | Linux 2.6 completo, offline | copy.sh/v86 |
| ☁️ CoCalc | Python/Jupyter na nuvem | cocalc.com |

### IDEs na nuvem (requer GitHub):
| IDE | Recursos |
|-----|---------|
| ⚡ StackBlitz | Node.js + npm completo |
| 🟠 Gitpod | Linux completo, 50h grátis/mês |
| 🐙 Codespaces | VS Code completo, 60h grátis/mês |
| 💻 VS Code Web | Editor online, grátis |

---

## 4. IA — Jasmim
- Botão 🤖 no editor → abre chat com a IA
- Peça código, debug, explicações em português
- Modelos: Gemini (grátis com sua chave), GPT-4, Claude
- Configure sua chave em: Configurações ⚙️ → GEMINI DIRETO DO CELULAR
- Chave gratuita: aistudio.google.com → Get API Key

---

## 5. GitHub — Clone e Push
1. Menu ☰ → **GitHub — Clonar / Enviar**
2. Clonar: cole a URL → toque em Importar
3. Push: selecione o repositório → toque em Enviar
4. Token gratuito: github.com → Settings → Developer settings → Personal access tokens

**Erro 403 ao clonar?**
→ Repositório privado: adicione token de acesso
→ Rate limit: aguarde alguns minutos ou adicione token
→ Token grátis: não tem limite de repositórios privados

---

## 6. Playground HTML
- Abra um arquivo .html → toque em ▶
- Preview abre em tela cheia com o código do arquivo
- Salve snippets para reutilizar (ícone 💾)
- Auto-render: atualiza preview ao digitar

---

## 7. Extrator de Sites
- Projetos → menu ☰ → Extrair Site
- Cole a URL do site → toque em Extrair
- Extrai: HTML, rotas, scripts, links, fontes, dados

---

## 8. Importar / Exportar
- **Importar ZIP:** Projetos → Importar ZIP (máx. 100MB)
- **Importar TAR/TGZ:** Projetos → Importar TAR/TGZ
- **Exportar ZIP:** Menu ☰ → Exportar ZIP
- **Clonar GitHub:** Projetos → Git Clone → cole a URL

---

## 9. Plugins e Linguagens
1. Aba **Plugins**
2. Escolha a linguagem/ferramenta
3. Toque Instalar → confirme

Linguagens disponíveis: Node.js, Python, Java, Flutter, Dart, Ruby, Go, Rust, PHP

---

## 10. Banco de Dados
- Menu ☰ → **Banco de Dados**
- Neon.tech (PostgreSQL grátis): neon.tech → criar projeto → copiar connection string
- Cole a string → execute SQL direto no app

---

## 11. Modo Termux (offline total)
> Use o próprio celular como servidor — zero internet

### Instalação no Termux:
\`\`\`bash
pkg update && pkg install nodejs git curl -y
\`\`\`

### Conectar:
- Configurações ⚙️ → MODO TERMUX → Ativar
- URL: http://localhost:8080

---

## 12. Preparar APK
Para gerar o APK do AppIDE:

\`\`\`bash
# 1. Instale as dependências
npm install

# 2. Gere o APK com EAS Build (grátis)
npx eas build --platform android --profile preview

# 3. Ou build local (requer Android Studio):
npx expo run:android --variant release
\`\`\`

Configurações no eas.json:
- profile "preview" → APK instalável diretamente
- profile "production" → AAB para Google Play

---

## 13. Problemas Comuns

**Tela branca ao abrir**
→ Limpe o cache do app → reabra

**GitHub clone deu 403**
→ Adicione token de acesso (ver seção 5)
→ Repositório público com muitas requisições: aguarde 1 minuto

**Importar ZIP deu erro**
→ Verifique se o arquivo é um .zip válido
→ Tente exportar novamente

**IA não responde**
→ Verifique a chave API em Configurações
→ Chave gratuita: aistudio.google.com

---

*AppIDE v2.9.0 — Funciona localmente, sem servidor, do seu jeito.*
` },
      { name: "TERMUX-SETUP.sh", content: `#!/bin/bash
# AppIDE — Instalação Termux
# Cole no Termux e execute

pkg update && pkg upgrade -y
pkg install nodejs git curl -y

echo ""
echo "AppIDE pronto para uso no Termux!"
echo "Abra o AppIDE → Configurações → Modo Termux → Ativar"
` },
      { name: "ATALHOS.md", content: `# ⌨️ Atalhos e Dicas — AppIDE v2.9.0

## Menu ☰ (Menu Completo)
| Opção | O que faz |
|-------|-----------|
| 📄 Importar Arquivo | Importa qualquer .js .py .html .txt |
| 📥 Importar ZIP | Importa projeto compactado |
| 📤 Exportar ZIP | Exporta projeto atual |
| 🤖 Jasmim | Abre assistente IA |
| 🔗 GitHub | Clonar / enviar repositório |
| 📦 Instalar Biblioteca | npm install, pip install... |
| 🗄️ Banco de Dados | Conectar PostgreSQL/Neon |
| 📸 Checkpoint | Salvar ponto de restauração |
| 🌐 Preview HTML | Visualizar HTML ao vivo |
| ⬛ Terminal | Abrir terminal bash |
| 🗑️ Limpar Projeto | Apagar todos os arquivos |

## Barra do Editor
- **⚡** — barra de símbolos rápidos: {}, [], (), ;, etc.
- **🤖** — IA Jasmim (canto superior direito)
- **☰** — menu completo (canto superior esquerdo)
- **▶** — executar arquivo atual

## Terminal
- ↑ / ↓ — histórico de comandos
- 🗑️ — limpar tela
- Ctrl+C (botão no teclado) — cancelar processo

## Plugins — Aba 📱 Android
Para instalar Java, Node.js, Python, Flutter no celular via Termux:
→ Plugins → aba "📱 Android" → escolha → Instalar
` },
    ],
  },
};
