# PanelHaus

A Goodreads-style bookshelf for comic books. Search series through the Comic Vine API, save issues to your reading list, and track what you want to read, are reading, and have finished.

## Tech stack

- **Client:** React 19, React Router 7, Tailwind CSS 4, Vite (`client/`)
- **Server:** Node.js, Express 5, PostgreSQL via `pg` (`server/`)
- **Data:** [Comic Vine API](https://comicvine.gamespot.com/api/) for series and issue metadata

## Getting started

### Prerequisites

- Node.js (with `node --test` support)
- PostgreSQL
- A Comic Vine API key

### Server

Create `server/.env`:

```env
DATABASE_URL=postgres://user:password@localhost:5432/panelhaus
COMIC_VINE_API_KEY=your-comic-vine-key
AUTH_SECRET=a-long-random-string
PORT=3000
```

Then load the schema and start the API:

```sh
cd server
npm install
psql "$DATABASE_URL" -f db/schema.sql
npm run db:test   # optional: check the database connection
npm run dev
```

### Client

```sh
cd client
npm install
npm run dev
```

Vite proxies `/api` to `http://localhost:3000`.

### Tests

```sh
cd client
node --test src/utils/*.test.js
npm run lint
```

## Current features

- Sign up and log in with a session cookie
- Browse and search series through Comic Vine, plus a page for each series
- A reading list per issue (want to read, reading, finished), including adding a whole series at once
- A home page that pulls from your list: shelves, currently reading and up next

## Roadmap

Items marked ★ are core Goodreads features.

### 1. Fix first (things already in the app)

- [ ] **Placeholder pages:** `/reading-orders`, `/profile`, `/calendar` and the `/shelves/*` links all show the placeholder page.
- [ ] **Header fetches the account separately:** `Header.jsx` calls `/auth/me` on its own, so every page asks twice. Move the user into one shared React context.
- [ ] **Any logged-in user can list every account:** `GET /api/v1/users` returns all users. Lock it down before anything goes public.
- [ ] **No page for a single issue:** issues can only be added from the series page.
- [ ] **Removing from the list:** the `DELETE` endpoint exists, but there's no button for it.

### 2. Ratings & reviews ★

- [ ] 1–5 star rating per issue and per series, with separate Story and Art scores
- [ ] Written reviews with a spoiler toggle
- [ ] Average rating and rating count on series and issue pages
- [ ] New table: `reviews` (user, comic or series, rating(s), text, timestamps)

### 3. Shelves

- [ ] Custom shelves you name yourself, like "Spider-Verse" or "Favorites" (Pull list and Dropped can come back as real shelves)
- [ ] Mark a whole series read or unread in one click
- [ ] Read dates you can edit, plus re-reads
- [ ] Sorting and filtering on the list page: by date added, rating, publisher or year
- [ ] New tables: `shelves` and `shelf_items`

### 4. Reading progress & stats

- [ ] **2026 Challenge:** a goal you set yourself, counted from `finished_at`
- [ ] **Activity history:** a real `activity` table so Recent Activity stops being sample data and keeps more than the latest change
- [ ] **Year in Comics:** issues read, top publishers, creators and characters, pages read
- [ ] Up Next using Comic Vine's issue numbers, not issue titles

### 5. Comic-specific features

- [ ] **Reading orders:** curated or user-made orders for events, like the issues of *Secret Wars* in sequence across series
- [ ] **New This Wednesday and release calendar:** Comic Vine's `store_date` and `cover_date`, filtered to series you follow
- [ ] **Pull list:** follow a series and get new issues added automatically
- [ ] **Creator and character pages:** writers, artists and characters, each with their issues
- [ ] **Formats:** single issue versus TPB or omnibus, with "finished the TPB" marking issues #1–6 as read
- [ ] Variant covers

### 6. Social ★

- [ ] Public profile pages with shelves, reviews and stats, plus privacy settings (today's auth check blocks viewing anyone else's data)
- [ ] Friends or follows, plus a feed of what they're reading and rating
- [ ] Likes and comments on reviews
- [ ] User-made public lists ("Best Batman stories")
- [ ] New tables: `follows`, `review_comments`, `lists` and `list_items`

### 7. Discovery

- [ ] Recommendations: "readers who liked X also liked Y", from co-shelving and ratings
- [ ] Popular and trending series on the site, using the save counts the server already tracks (`findSaveCounts`)
- [ ] Browse by publisher, genre, era or creator
- [ ] A search bar in the header that works on any page

### 8. Account & infrastructure

- [ ] Profile settings (name, avatar, bio), password change and reset, delete account
- [ ] Import from Goodreads or League of Comic Geeks via CSV, and export
- [ ] **Store comic data locally:** cache Comic Vine results in the database (`comics` and `volumes` tables) to avoid rate limits and make ratings, stats and search fast
- [ ] Database migrations to replace the in-place `DO $$` patches in `schema.sql`
- [ ] Tests for the API and React components, plus CI
- [ ] Deployment

### Suggested order

1. Section 1 fixes and the local comic data cache
2. Ratings and reviews
3. Issue page and the remove button
4. Activity history and the challenge
5. Custom shelves
6. Comic features: release calendar, pull list, reading orders
7. Social and public profiles
8. Recommendations
