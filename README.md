# Riani Shop

Production architecture:

```text
riani-shop/
  frontend/   # React + Vite → Vercel
  backend/    # Node + Express → Render
  render.yaml
```

## Local development

### Backend
```bash
cd backend
cp .env.example .env   # fill MONGO_URI + JWT_SECRET
npm install
npm run dev
```
Health: http://localhost:5000/api/health

### Frontend
```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```
App: http://localhost:5173

## Production

### Frontend (Vercel)
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework: Vite
- Env: `VITE_API_URL=https://YOUR-RENDER-URL/api`

### Backend (Render)
- Root Directory: `backend`
- Build: `npm install`
- Start: `npm start`
- Health check: `/api/health`
- Env: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL=https://riani-shop.com,https://www.riani-shop.com`

## Security note
Never commit `.env` files. If secrets were pushed to GitHub, rotate MongoDB password and `JWT_SECRET`.
