
<div align="center">


<img width="1415" height="722" alt="image" src="https://github.com/user-attachments/assets/a118ec9d-c558-4951-8d71-6cff7cfcc978" />


### Portfolio de Mari - Galeria Imersiva Interativa

Uma galeria de portfolio full-stack com animacoes GSAP, grade arrastavel infinita e reveal cinematico, desenvolvida com tecnologias modernas.

• [Galeria do Projeto](#galeria-do-projeto) • [Instalacao](#instalacao)

---

</div>

## Galeria do Projeto

<div align="center">

### Tela de Entrada

<table>
  <tr>
    <td width="100%" align="center">
    
  <img width="1319" height="982" alt="Screenshot 2026-04-28 195410" src="https://github.com/user-attachments/assets/7b49b0b3-5e87-4dd0-af5f-c2bf24c81021" />

  </tr>
</table>

### Grade Principal

<table>
  <tr>
    <td width="50%" align="center">
    <img width="1317" height="976" alt="Screenshot 2026-04-28 195422" src="https://github.com/user-attachments/assets/609ca69a-4e70-4312-a6c7-1512ed3957a6" />
      <br>
      <sub><b>Grade Imersiva</b> - Layout editorial infinito e arrastavel</sub>
    </td>
    <td width="50%" align="center">
      <img width="1328" height="888" alt="Screenshot 2026-04-28 195451" src="https://github.com/user-attachments/assets/eca58f77-6ade-435e-b7a0-fc76a71f7e29" />
      <br>
      <sub><b>Interacao de Drag</b> - Navegacao por arrasto com momentum e inercia</sub>
    </td>
  </tr>
</table>

### Expansao de Projeto

<table>
  <tr>
    <td width="50%" align="center">  <img width="1012" height="156" alt="image" src="https://github.com/user-attachments/assets/b30a4f3a-7e3f-4f66-8f5a-21c54c1a224a" />
      <br>
      <sub><b>Expand Animado</b> - Abertura fluida de projeto com GSAP clip-path</sub>
    </td>
    <td width="50%" align="center"> <img width="1063" height="987" alt="image" src="https://github.com/user-attachments/assets/c9f5528c-bb7d-4c59-9da3-a30623e0c8c0" />
      <br>
      <sub><b>Detalhe do Projeto</b> - Visualizacao completa com titulo e informacoes</sub>
    </td>
  </tr>
</table>

### Responsivo

<table>
  <tr>
    <td width="100%" align="center"> <img width="922" height="890" alt="image" src="https://github.com/user-attachments/assets/0bb6be14-9077-49b4-8a01-0773dd2ab4ca" />
      <br>
      <sub><b>Mobile</b> - Experiencia adaptada para dispositivos moveis</sub>
    </td>
  </tr>
</table>

### Caracteristicas Visuais

<table>
  <tr>
    <td align="center" width="33%">
      <h3>Design Editorial</h3>
      <p>Interface minimalista inspirada em portfolios de fotografia de luxo</p>
    </td>
    <td align="center" width="33%">
      <h3>Animacoes Fluidas</h3>
      <p>Transicoes suaves com GSAP CustomEase e easing personalizado</p>
    </td>
    <td align="center" width="33%">
      <h3>100% Responsivo</h3>
      <p>Grade adaptativa para todos os tamanhos de tela</p>
    </td>
  </tr>
</table>

</div>

---

## Indice

- [Visao Geral](#visao-geral)
- [Stack Tecnologica](#stack-tecnologica)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Funcionalidades](#funcionalidades)
- [Instalacao](#instalacao)
- [Deploy](#deploy)

---

## Visao Geral

Portfolio imersivo de Mari, construido como uma galeria editorial infinita. O usuario navega por uma grade arrastavel de projetos com animacoes cinematicas de entrada, expansao de cards via clip-path e tipografia customizada. O projeto roda como Cloudflare Worker com SSR via TanStack Start.

### Status do Projeto

```
Interface:   ████████████████████  100% Completo
Animacoes:   ████████████████████  100% Completo
Deploy:      ████████████████████  100% Ativo
```

---

## Stack Tecnologica

<div align="center">

### Frontend

| Tecnologia              | Versao  | Finalidade                            |
| ----------------------- | ------- | ------------------------------------- |
| **React**               | 19.2.0  | Biblioteca de interface               |
| **TypeScript**          | 5.8.3   | Tipagem estatica                      |
| **Vite**                | 7.3.1   | Build tool e desenvolvimento rapido   |
| **TanStack Router**     | 1.168.0 | Roteamento type-safe                  |
| **TanStack Start**      | 1.167.x | SSR e server-side rendering           |
| **GSAP**                | 3.15.0  | Animacoes e transicoes avancadas      |
| **Tailwind CSS**        | 4.2.1   | Estilizacao utilitaria                |
| **Tweakpane**           | 4.0.5   | Painel de debug de parametros em tempo real |

### Infraestrutura

| Tecnologia                | Versao  | Finalidade                          |
| ------------------------- | ------- | ----------------------------------- |
| **Cloudflare Workers**    | -       | Runtime de deploy com SSR           |
| **Wrangler**              | -       | CLI de deploy para Cloudflare       |
| **@cloudflare/vite-plugin** | 1.25.5 | Integracao Vite com Workers         |

</div>

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────┐
│                  BROWSER (Cliente)                  │
│         React 19 + GSAP + TanStack Router           │
└─────────────────────┬───────────────────────────────┘
                      │ SSR / Hydration
                      ▼
┌─────────────────────────────────────────────────────┐
│             CLOUDFLARE WORKER (Servidor)            │
│        TanStack Start Server Entry + Wrangler       │
└─────────────────────┬───────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
┌─────────────────┐     ┌──────────────────────┐
│  Route Handler  │     │    Static Assets      │
│  (TanStack)     │     │  Cloudflare CDN Edge  │
└─────────────────┘     └──────────────────────┘
```

### Fluxo de Animacao

```
Entrada da pagina
      │
      ▼
PageReveal (GSAP timeline)
  1. Nome aparece (yPercent + opacity)
  2. Subtitulo e tagline entram (stagger)
  3. Pausa de 0.55s
  4. Texto some (fade out + y)
  5. Panel sobe (clip-path wipe)
      │
      ▼
ImmersivePortfolioGrid
  - Grade de cards renderizada
  - Drag com inertia ativado
  - Hover e click expansao via GSAP
```

---

## Funcionalidades

### Galeria Interativa

- Grade infinita de projetos com layout em colunas e linhas dinamicas
- Navegacao por arrasto (drag) com momentum e inercia
- Snap de posicao ao soltar
- Velocidade de movimento configuravel via Tweakpane

### Animacoes

- Page reveal cinematico com wipe via `clip-path`
- Easing customizado `galleryHop` registrado no GSAP CustomEase
- Expansao de card com `clip-path` animado para fullscreen
- Fade e translate nas transicoes de texto
- Stagger em elementos de UI

### Interface

- Tipografia customizada com fontes `font-estrella-early` e `font-dx-burst`
- Fundo texturizado com dot grid via `radial-gradient`
- Paleta neutra monocromatica
- Layout responsivo com `clamp()` para tipografia fluida
- Painel de debug Tweakpane para ajuste de parametros em tempo real

---

## Instalacao

### Pre-requisitos

- Node.js 18+
- npm ou bun

### Instalacao Local

```bash
# 1. Clone o repositorio
git clone https://github.com/eryckassis/portfolio-maria.git
cd portfolio-maria

# 2. Instale as dependencias
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse em `http://localhost:5173`.

---

## Deploy

O projeto e deployado como **Cloudflare Worker** com SSR.

```bash
# Build e deploy para producao
npm run build && npx wrangler deploy
```

A URL de producao sera `tanstack-start-app.<seu-usuario>.workers.dev` conforme configurado no `wrangler.jsonc`.

---

<div align="center">

**Desenvolvido para Mari**

</div>
