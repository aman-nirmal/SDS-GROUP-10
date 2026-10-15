# COEP Venue Booking System

A web application for COEP Technological University to check availability and book campus venues such as classrooms, seminar halls, and auditoriums.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS
- **Database & Backend:** PostgreSQL (Supabase)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account / PostgreSQL instance

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/venue-booking-system.git
   cd venue-booking-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase project URL and anon key to `.env.local`.

4. **Start the local dev server:**
   ```bash
   npm run dev
   ```

## Git Workflow

To keep the repository clean and avoid merge conflicts:

1. Always pull latest `main` before starting:
   ```bash
   git checkout main
   git pull origin main
   ```

2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes and commit using conventional commit messages (present tense, no emojis):
   ```bash
   git commit -m "feat: add slot selection modal"
   ```

4. Make sure you don't commit any `.env` or credential files:
   ```bash
   git status
   ```

5. Push your branch and open a PR against `main`. Every PR needs at least one review before merging.
