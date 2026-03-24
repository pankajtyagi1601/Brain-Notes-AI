# Brain Notes AI 🧠

> A notes app where the AI actually knows what *you've* written — not just generic internet knowledge.

<div align="center">
  
[![Live Demo](https://img.shields.io/badge/Live%20Demo-brain--notes--ai.vercel.app-black?style=flat-square&logo=vercel)](https://brainic-ai.vercel.app)
[![Source](https://img.shields.io/badge/Source-GitHub-181717?style=flat-square&logo=github)](https://github.com/pankajtyagi1601/brain-notes-ai)
![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Convex](https://img.shields.io/badge/Convex-EE342F?style=flat-square)

</div>

---

## 🧩 What It Does

Most AI chatbots answer from the internet. Brain Notes answers from **your notes**.

Write something down → ask the chatbot a question → it searches your own notes first, then answers. Perfect for students, researchers, and anyone who thinks out loud in writing.

---

## 💡 The Core Idea: RAG (Retrieval Augmented Generation)

Standard LLMs hallucinate because they answer from training data. Brain Notes uses **RAG** to ground every response in your actual notes:

```
User question
     │
     ▼
Semantic search over user's notes (vector similarity)
     │
     ▼
Top matching note chunks passed as context to LLM
     │
     ▼
Answer grounded in what YOU wrote — not generic knowledge
```

---

## ⚡ Technical Highlights

**Real-time tool-calling with Vercel AI SDK v5**
The chatbot can call tools mid-conversation (e.g., fetch a specific note, search by tag) and stream the result back — all within a single turn, with no page reload.

**Convex backend for live data**
Convex's real-time sync means notes appear instantly across tabs. No polling, no manual cache invalidation.

**OpenRouter API for model flexibility**
Swapping the underlying LLM is a one-line config change — the app isn't locked to a single provider.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Backend / DB | Convex (real-time backend + auth) |
| AI | Vercel AI SDK v5, OpenRouter API |
| RAG | Semantic search over user note corpus |
| Styling | Tailwind CSS, shadcn/ui |
| Deployment | Vercel |

---

## ✨ Features

- 📝 **Note editor** — create, edit, delete notes with live sync
- 🤖 **AI chatbot** — asks questions, gets answers grounded in your notes
- 🔍 **RAG retrieval** — context-aware responses, not generic LLM output
- ⚡ **Tool-calling** — AI fetches live note data mid-conversation
- 🔐 **Secure auth** — Convex-backed authentication
- 🎯 **Use cases** — studying, research, personal knowledge base, brainstorming

---

## 🚀 Running Locally

```bash
git clone https://github.com/pankajtyagi1601/brain-notes-ai
cd brain-notes-ai
npm install

# Setup Convex
npx convex dev

# Setup environment
cp .env.example .env.local
# Set CONVEX_URL, OPENROUTER_API_KEY

npm run dev

Open [http://localhost:3000](http://localhost:3000)
```



---

## 📬 Contact

Built by [Pankaj Tyagi](https://pankajtyagi-portfolio.vercel.app) · [pankajtyagi1601@gmail.com](mailto:pankajtyagi1601@gmail.com)
