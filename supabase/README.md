# LOCUS Supabase Database Setup & Migrations

This folder contains the complete PostgreSQL database migration and Row Level Security (RLS) setup for **LOCUS: COEP Technological University Venue & Event Booking System**.

## Supabase Instance Details

- **Supabase Project URL:** `https://ozdthbfemtuaefrrxwnm.supabase.co`
- **Dashboard:** [https://supabase.com/dashboard/project/ozdthbfemtuaefrrxwnm](https://supabase.com/dashboard/project/ozdthbfemtuaefrrxwnm)

## How to Apply the Migration

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard/project/ozdthbfemtuaefrrxwnm).
2. Navigate to the **SQL Editor** tab from the left sidebar.
3. Click **New query**.
4. Open [20261028_locus_booking_schema.sql](./migrations/20261028_locus_booking_schema.sql), copy its entire contents, and paste into the SQL Editor.
5. Click **Run** (or press `Ctrl+Enter`).
6. Supabase will create or update:
   - `venues` (with active status index)
   - `events` (with date and club indexes)
   - `clubs` (with authorized club leads)
   - `users` (with official test credentials)
   - `bookings` (with unique reference, RLS policies, audit indexes, and updated_at trigger)

## Environment Configuration

In your project root, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Populate the values from your Supabase Dashboard (**Project Settings** -> **API**):

```env
VITE_SUPABASE_URL=https://ozdthbfemtuaefrrxwnm.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_publishable_anon_key_here
```
