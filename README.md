# 💪 Treino App

Um aplicativo web moderno e responsivo para acompanhar treinos na academia, desenvolvido especificamente para Jana e Leandro.

## 🚀 Características

### 📱 Progressive Web App (PWA)
- **Funciona offline** - Use na academia sem internet
- **Instalável** - Adicione à tela inicial como app nativo
- **Responsivo** - Funciona perfeitamente em todos os dispositivos
- **Rápido** - Cache inteligente para carregamento instantâneo

### 🏋️‍♀️ Funcionalidades de Treino
- **Dois perfis personalizados**: Jana e Leandro com treinos específicos
- **4 tipos de treino** para cada usuário
- **Tracking de progresso** com marcação de séries completadas
- **Sistema de peso** - Armazena os últimos 3 pesos usados por exercício
- **Cronômetros inteligentes**:
  - Timer de descanso (45s) automático entre séries
  - Timer personalizado para exercícios baseados em tempo
- **Vídeos demonstrativos** - 2 ângulos diferentes para cada exercício
- **Imagens ilustrativas** dos grupos musculares trabalhados

### 🎨 Design Moderno
- **Paleta de cores profissional**:
  - `#0d1b2a` - Azul escuro principal
  - `#1b263b` - Azul médio escuro
  - `#415a77` - Azul médio
  - `#778da9` - Azul claro
  - `#e0e1dd` - Cinza claro
- **Interface intuitiva** com navegação por gestos
- **Animações fluidas** e feedback visual
- **Modo escuro** otimizado para uso na academia

### 🔧 Tecnologias Utilizadas
- **HTML5** semântico com acessibilidade
- **CSS3** moderno com Grid, Flexbox e Custom Properties
- **JavaScript ES6+** modular e orientado a objetos
- **Service Worker** para funcionalidade offline
- **LocalStorage** para persistência de dados
- **Web APIs**: Vibration, Audio, Visibility

## 📦 Estrutura do Projeto

```
treino/
├── index.html              # Página principal
├── manifest.json           # Configuração PWA
├── sw.js                   # Service Worker
├── styles/
│   ├── main.css           # Estilos base e variáveis CSS
│   ├── components.css     # Componentes da interface
│   └── responsive.css     # Media queries e responsividade
├── js/
│   ├── app.js            # Aplicação principal
│   ├── navigation.js     # Sistema de navegação
│   ├── exercise.js       # Gerenciamento de exercícios
│   ├── timer.js          # Sistema de cronômetros
│   ├── storage.js        # Gerenciamento de dados locais
│   └── utils.js          # Funções utilitárias
├── data/
│   ├── treinoJana.json   # Dados dos treinos da Jana
│   └── treinoLeandro.json # Dados dos treinos do Leandro
├── icons/                # Ícones para PWA
└── data/foto[Jana|Leandro]/ # Imagens dos exercícios
```

## 🎯 Como Usar

### 1. Seleção de Usuário
- Escolha entre **Jana** ou **Leandro**
- Cada usuário tem treinos personalizados

### 2. Escolha do Treino
- Visualize os 4 tipos de treino disponíveis
- Cada treino tem foco específico (ex: "Pernas + Ombros")

### 3. Execução dos Exercícios
- **Para exercícios com repetições**:
  - Marque cada série como concluída
  - Timer de descanso inicia automaticamente
  - Registre o peso utilizado (opcional)
- **Para exercícios com tempo**:
  - Use o cronômetro integrado
  - Controle play/pause/reset
- **Vídeos demonstrativos**:
  - Clique no botão play para ver os vídeos
  - 2 ângulos diferentes por exercício

### 4. Acompanhamento
- Barra de progresso mostra avanço no treino
- Histórico de pesos dos últimos treinos
- Navegação entre exercícios anterior/próximo

## 🔧 Instalação Local

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/treino.git
   cd treino
   ```

2. **Sirva os arquivos** (necessário para PWA):
   ```bash
   # Com Python 3
   python -m http.server 8000
   
   # Com Node.js
   npx http-server
   
   # Com PHP
   php -S localhost:8000
   ```

3. **Acesse** `http://localhost:8000`

## 🌐 Deploy no GitHub Pages

O app está configurado para deploy automático no GitHub Pages:

1. **Configure o repositório**:
   - Vá em Settings > Pages
   - Source: Deploy from a branch
   - Branch: main / root

2. **Acesse**: `https://seu-usuario.github.io/treino`

## 📱 Instalação como PWA

### Android
1. Abra o app no Chrome
2. Toque em "Adicionar à tela inicial" no menu
3. Confirme a instalação

### iOS
1. Abra o app no Safari
2. Toque no ícone de compartilhamento
3. Selecione "Adicionar à Tela de Início"

### Desktop
1. Abra no Chrome/Edge
2. Clique no ícone de instalação na barra de endereços
3. Confirme a instalação

## 🔒 Privacidade e Dados

- **100% offline** - Todos os dados ficam no seu dispositivo
- **Sem servidor** - Não enviamos dados para lugar algum
- **Open source** - Código totalmente aberto e auditável

## 🛠️ Desenvolvimento

### Estrutura Modular
O código é organizado em módulos independentes:
- `Navigation` - Gerencia navegação entre telas
- `ExerciseManager` - Controla exercícios e progresso
- `TimerManager` - Gerencia cronômetros
- `StorageManager` - Persistência de dados

### Debug
No ambiente de desenvolvimento, acesse `window.TreinoAppDebug` no console para debug.

### Contribuindo
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Autores

- **Desenvolvedor**: GitHub Copilot
- **Usuários**: Jana e Leandro

---

**💪 Bons treinos!** 🏋️‍♀️🏋️‍♂️
