# English Flashcards

A vocabulary learning app for Russian-speaking students. Study English words with flashcards, take quizzes, and hear correct pronunciation — all without an internet connection or account.

## What it does

- Flashcards with English words, Russian translations, categories, images, and descriptions
- Quiz mode — type the translation, get instant audio feedback
- Text-to-speech pronunciation for every word
- Filter words by topic/category
- Flip direction: study EN → RU or RU → EN
- **Teacher mode** (password: `teacher123`) — add, edit, delete cards, export as JSON

All data is saved in the browser's local storage — no server needed.

---

## Option 1 — Deploy to GitHub Pages (recommended)

This is the easiest way to host the app for free so anyone can open it in a browser.

### Step 1 — Prepare your files

You downloaded (or cloned) this folder. Now rename three files:

| Rename this file | To this name |
|---|---|
| `package.standalone.json` | `package.json` |
| `vite.standalone.config.ts` | `vite.config.ts` |
| `tsconfig.standalone.json` | `tsconfig.json` |

Also delete the original `vite.config.ts` (the Replit version) before renaming.

### Step 2 — Create a GitHub repository

1. Go to [github.com](https://github.com) and sign in
2. Click **+** → **New repository**
3. Give it a name, e.g. `english-flashcards`
4. Keep it **Public**
5. Click **Create repository**

### Step 3 — Upload your files

On the new repository page, click **uploading an existing file**, then drag and drop the entire `english-app` folder contents (all files and folders inside it). Commit the upload.

Or, if you have Git installed locally:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/english-flashcards.git
git push -u origin main
```

### Step 4 — Enable GitHub Pages

1. In your repository, go to **Settings** → **Pages** (left sidebar)
2. Under **Source**, select **GitHub Actions**
3. That's it — GitHub will automatically build and deploy the app

The `.github/workflows/deploy.yml` file included here does everything automatically on every push.

### Step 5 — Open your app

After 1–2 minutes, your app will be live at:

```
https://YOUR_USERNAME.github.io/english-flashcards/
```

(Replace `YOUR_USERNAME` and `english-flashcards` with your actual GitHub username and repository name.)

---

## Option 2 — Run locally on your computer

You need [Node.js 20+](https://nodejs.org) installed.

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

To build a production version:

```bash
npm run build
```

The built files will be in the `dist/` folder — you can upload them to any web host.

---

## Updating your word list

Every time you push a change to the `main` branch on GitHub, the site rebuilds automatically in about 1–2 minutes.

To add words without code: open the app, log in as a teacher (password: `teacher123`), add your words, click **Export JSON**, and save the downloaded `words.json` file. You can keep it as a backup or use it to restore words on a new device by copying the contents back into the app.

---

## Folder structure

```
english-flashcards/
├── src/
│   ├── components/     # UI components (cards, quiz, sidebar…)
│   ├── hooks/          # useCards (localStorage) and useVoice (speech)
│   ├── pages/          # Home page
│   ├── lib/            # Utilities
│   ├── types.ts        # Card type definition
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .github/
│   └── workflows/
│       └── deploy.yml  # Auto-deploy to GitHub Pages
├── index.html
├── package.json        # (renamed from package.standalone.json)
├── vite.config.ts      # (renamed from vite.standalone.config.ts)
└── tsconfig.json       # (renamed from tsconfig.standalone.json)
```
