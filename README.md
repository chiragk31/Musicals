<div align="center">
  <h1>🎵 Musicals</h1>
  <p>An open source music streaming platform — discover, upload, and enjoy music.</p>

  ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
  ![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
  ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)
</div>

---

## ✨ Features

- 🎵 **Stream music** — play songs with a persistent audio player
- 🔍 **Search** — find songs and artists
- 📚 **Library** — create and manage playlists
- 💜 **Like songs** — build your personal collection
- 🎤 **Upload as artist** — publish your own tracks with audio + thumbnail
- 🔐 **Auth** — email/password authentication via Supabase
- 📱 **Responsive** — works on desktop and mobile

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS + shadcn/ui |
| State / data | TanStack Query (React Query) |
| Routing | React Router v6 |
| Backend / Auth | Supabase (PostgreSQL + Auth + Storage) |
| Forms | React Hook Form + Zod |

## 📁 Project Structure

```
src/
├── components/       # Shared UI components
│   ├── ui/           # shadcn/ui primitives
│   ├── MusicPlayer   # Persistent bottom audio player
│   ├── UploadSong    # Artist upload form
│   ├── SongCard      # Song display card
│   ├── MyPlaylists   # Playlist management
│   └── LikedSongs    # Liked songs list
├── pages/
│   ├── Index         # Landing page
│   ├── Auth          # Login / Sign up
│   ├── Home          # Main feed
│   ├── Search        # Song search
│   ├── Library       # Playlists
│   └── MyMusic       # Artist dashboard
├── integrations/
│   └── supabase/     # Supabase client + generated types
└── hooks/            # Custom React hooks

supabase/
└── migrations/       # Database schema (run these in order)
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone and Install

```bash
git clone https://github.com/chiragk31/Musicals.git
cd Musicals
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com/dashboard)
2. Go to **SQL Editor** and run the migrations **in order**:
   - `supabase/migrations/20251004141653_...sql` — creates all tables, RLS policies, storage buckets
   - `supabase/migrations/20251011065430_...sql` — security patch for profiles
3. Go to **Project Settings → API** and copy your **Project URL** and **anon key**

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) 🎉

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profile (username, linked to auth.users) |
| `user_roles` | Role per user: `user` or `artist` |
| `songs` | Song metadata + audio/thumbnail URLs |
| `playlists` | User-created playlists |
| `playlist_songs` | Many-to-many: playlists ↔ songs |
| `liked_songs` | User's liked songs |
| `playback_state` | Persisted playback position per user |

Storage buckets: **`audio-files`** (public) · **`thumbnails`** (public)

## 🔐 Auth & Security

- Email/password authentication (Supabase Auth)
- All tables protected with **Row Level Security (RLS)** — users can only access their own data
- New user signup automatically creates a profile + assigns `user` role via a database trigger

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `localhost:8080` |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

## 👤 Author

**chiragk31**

---

<div align="center">
  <sub>Built with React, Vite, and Supabase</sub>
</div>
