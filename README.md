# Notely 📖 

Notely is a premium, SaaS-style workspace dashboard designed to act as a highly optimized, decentralized productivity hub. Built with native front-end technologies and an intelligent serverless backend, it serves as a lightweight, secure, and privacy-first solution for daily organization.

## 🚀 Live Demo
**Open the application here:** [👉 https://notely-note.netlify.app ]

---

## ✨ Key Features

* **Multi-Task Board Manager:** Create, delete, and manage multiple completely separate task list categories (e.g., "Work", "Personal", "Groceries") side-by-side.
* **Hybrid Note Workspace:** Capture thoughts on the fly via rich text notes or record high-fidelity voice memos.
* **Production-Ready Audio Streaming:** Automatically compresses microphone data via the audio-optimized *Opus* codec, securely uploading it via serverless pipelines to cloud storage.
* **Inline Editing & Controls:** Seamless inline editing toggles for both text notes and individual checklist tasks, featuring interactive completion strike-throughs.
* **Workspace Isolation:** An onboard session system prompts users for a unique workspace name, cleanly sandboxing data streams on a per-user basis.
* **100% Mobile Responsive:** Fully optimized interface using dynamic media queries for a native mobile app experience on smartphones and tablets.

---

## 🛠️ Tech Stack & Architecture

What truly sets Notely apart is its **zero-database, privacy-first infrastructure**:

* **Frontend:** Semantic HTML5, CSS3 Grid/Flexbox (with Inter Typography & Dark Mode styling), Vanilla JavaScript (ES6+).
* **Serverless Backend:** Netlify Serverless Functions (Node.js runtime).
* **Cloud Storage:** Cloudinary SDK (Audio/Video dynamic routing pipelines).
* **Data Persistence:** Text documents, category board titles, and task completion metrics are serialized directly into the client browser's `localStorage` sandbox. This keeps user data perfectly separated and completely private to their own machine without data mixing.

---

## 📦 Local Setup Instructions

To run this project locally on your machine with active serverless backend capabilities, ensure you have the Netlify CLI installed:

1. Clone this repository to your local machine.
2. Install the necessary development dependencies:
```bash
   npm install