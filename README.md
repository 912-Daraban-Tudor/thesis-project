# R00m Finder

A full-stack web platform for students to find apartments and roommates in Cluj-Napoca, with map-based filtering, real-time chat, and spatial transport integration.

## Features

- Interactive Map View using Mapbox GL / Google Maps
- Search by address with fallback suggestions
- Filter by price, number of rooms, floor, year built, parking, heating
- Spatial filtering:
  - Apartments near a selected bus line
  - Apartments connected by bus route to a searched location (e.g. university)
- Real-time 1-on-1 chat using WebSocket (Socket.IO)
- Cloudinary-based image uploads (with drag & drop and preview)
- JWT-based authentication
- Responsive design using React + MUI
- Multi-container Docker deployment

## Demo

- **Frontend (Vercel):** [https://your-frontend.vercel.app](https://your-frontend.vercel.app)
- **Backend (Railway):** [https://your-backend.up.railway.app](https://your-backend.up.railway.app)

## Tech Stack

- **Frontend:** React 18 (Vite), MUI, Mapbox GL JS / Google Places Autocomplete
- **Backend:** Node.js, Express 5, PostgreSQL + PostGIS, Socket.IO
- **Image Upload:** Cloudinary (via multer-storage-cloudinary)
- **Authentication:** JWT + bcrypt
- **DevOps:** Docker, Railway (backend), Vercel (frontend)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

### 2. Set up environment variables

Create .env files for both frontend and backend.

server/.env:

PORT=
- DATABASE_URL=
- JWT_SECRET=
- CLOUDINARY_CLOUD_NAME=
- CLOUDINARY_API_KEY=
- CLOUDINARY_API_SECRET=
- CLIENT_URL=


client/.env:

REACT_APP_MAPBOX_TOKEN=
REACT_APP_GOOGLE_API_KEY=
REACT_APP_BACKEND_URL=


### 3. Run the app
## With Docker 
```bash
docker compose up --build
```

## Without Docker
```bash
# Terminal 1
cd server
npm install
npm start

# Terminal 2
cd client-cra
npm install
npm start
```