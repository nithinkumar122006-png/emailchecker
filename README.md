# Inbox Check

A React email-verification frontend with a Vercel serverless API proxy. It checks address format, mail-server (MX) configuration, mailbox signals, and disposable-email status using Abstract Email Intelligence.

## Run locally

1. Install dependencies: `npm install`
2. Set `ABSTRACT_API_KEY` in a local `.env.local` file (see below).
3. Run the development server: `npm run dev`

Open the URL printed by Vite (usually `http://localhost:5173`). The Vite development server also provides the local `/api/check-email` endpoint. The API key is read only by server-side code; do not add it to a `VITE_` variable or commit it to source control.

## Configure the API key

Create an API key for the [Abstract Email Intelligence API](https://docs.abstractapi.com/api/email-reputation). Abstract issues API-specific keys; the Email Intelligence key is required for the `emailreputation.abstractapi.com` endpoint used here. For local development, add `ABSTRACT_API_KEY=your_key` to `.env.local` (or configure it in Vercel and pull it with `npx vercel env pull .env.local`). For a deployed project, add `ABSTRACT_API_KEY` under **Project Settings → Environment Variables** in Vercel, then redeploy.

## Deploy to Vercel

1. Push this project to a Git provider such as GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Vercel detects Vite automatically. Add `ABSTRACT_API_KEY` to the project’s environment variables and deploy.

The deployed application uses `/api/check-email` as a server-side proxy, keeping the provider key out of the browser bundle. Email verification results are best-effort and do not prove that the person owns the mailbox.
