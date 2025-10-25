<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy it to Vercel.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js, Vercel CLI (for local development)

1. Install dependencies:
   ```bash
   npm install
   npm install -g vercel  # Install Vercel CLI globally
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Run the app with Vercel dev server (recommended):
   ```bash
   vercel dev
   ```
   This will start both the frontend and API functions locally.

   Alternatively, for frontend-only development (API calls will fail):
   ```bash
   npm run dev
   ```

## Deploy to Vercel

1. Install Vercel CLI if you haven't:
   ```bash
   npm install -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```

3. **Important**: Set the `GEMINI_API_KEY` environment variable in your Vercel project:
   - Go to your project settings on Vercel dashboard
   - Navigate to Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your actual Gemini API key
   - Redeploy for changes to take effect

## Architecture

This app uses a secure architecture for Vercel deployment:
- Frontend: React + Vite app served as static files
- Backend: Serverless functions in `/api` directory that handle Gemini API calls
- The API key is kept secure on the server side and never exposed to the client
