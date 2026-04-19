# SkillSwap Campus 🌟

A modern, full-stack platform where students can exchange skills and knowledge. One student might teach React, while another teaches Dance or Aptitude. It's a community-driven learning hub built by students, for students.

## 🚀 Features

- **Real User Authentication**: Secure Login & Signup with password hashing and JWT sessions.
- **Skill Marketplace**: Browse skills offered or request skills you want.
- **Swap Requests**: Send and manage exchange requests.
- **User Profiles**: Manage your own skills and view others' specialties.
- **Clean UI**: A premium, responsive design with dark mode support.

## 🛠 Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Wouter.
- **Backend**: Node.js, Express 5.
- **Database**: PostgreSQL with Drizzle ORM.
- **State Management**: TanStack Query (React Query).
- **Validation**: Zod.

## 📦 Project Structure

This project is organized as a professional monorepo using **pnpm workspaces**:

- `apps/frontend`: The React/Vite client.
- `apps/api-server`: The Express backend.
- `packages/db`: Drizzle schema and database client.
- `packages/api-spec`: OpenAPI specification and Orval configuration.
- `packages/api-zod`: Shared Zod schemas for validation.

## ⚙️ Local Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-link>
   cd Skill-Exchange-Hub
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your details:
   ```bash
   cp .env.example .env
   ```

4. **Prepare the Database**:
   Push the schema to your PostgreSQL instance:
   ```bash
   pnpm --filter @workspace/db run push
   ```

5. **Start Development Servers**:
   ```bash
   # Run everything
   pnpm run dev
   ```

## 🌐 Deployment

### Recommended Strategy: Render

1. **Database**: Create a PostgreSQL instance on Render or Supabase.
2. **Backend**:
   - Connect your GitHub repo.
   - Root Directory: `apps/api-server` (or manage from root with specific build commands).
   - Build Command: `pnpm install && pnpm run build`
   - Start Command: `pnpm run start`
   - Env Vars: `DATABASE_URL`, `SESSION_SECRET`.
3. **Frontend**:
   - Deploy as a Static Site.
   - Build Command: `pnpm run build`
   - Publish Directory: `apps/frontend/dist`

---

Built as part of the Full Stack Developer Internship selection process.
