# Altera To-Do — Backend API

Express + MongoDB REST API for the Altera task management app.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   MONGO_URI=your_mongodb_atlas_connection_string
   PORT=5000
   ```

3. Run locally:
   ```bash
   npm run dev
   ```

## Deploying to Render

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**: Add `MONGO_URI` and `PORT=5000`
- **Health Check Path**: `/api/health`

## Free Tier Keep-Alive Tip

Render free web services sleep after 15 minutes of inactivity. Set up a free 10-minute monitor on [cron-job.org](https://cron-job.org) pinging `https://your-app.onrender.com/api/health` to prevent cold starts.
