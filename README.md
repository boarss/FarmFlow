# FarmFlow - Agricultural Assistant PWA

A voice-first Progressive Web App designed for smallholder farmers in Africa to detect crop diseases, access market prices, manage farm records, and connect with buyers.

## 🌟 Features

- **Crop Disease Detection**: AI-powered disease identification via camera
- **Market Prices**: Real-time market prices and buyer connections
- **Planting Calendar**: Localized planting schedules based on weather
- **Farm Records**: Track planting, harvesting, and inputs
- **Voice-First Interface**: Optimized for low-literacy users
- **Offline-First**: Core features work without internet
- **Multi-Language**: English, Hausa, Yoruba, Igbo support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd FarmFlow
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- For development with mock data, keep `VITE_USE_MOCK_DATA=true`
- For production, add your Supabase credentials

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
FarmFlow/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── disease/        # Disease detection components
│   │   ├── market/         # Market & pricing components
│   │   ├── calendar/       # Planting calendar components
│   │   ├── records/        # Farm records components
│   │   ├── shared/         # Shared/common components
│   │   └── layout/         # Layout components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core libraries (Supabase, i18n)
│   ├── services/           # API services
│   ├── store/              # State management (Zustand)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── data/               # Mock data and constants
│   ├── App.tsx             # Main App component
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── supabase/              # Supabase migrations and config
│   └── migrations/        # Database migrations
├── services/              # Python microservices
│   ├── disease-detector/  # Disease detection service
│   └── satellite/         # NDVI satellite service
└── api/                   # Vercel serverless functions
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI

## 🗄️ Database Setup (Supabase)

### Option 1: Use Supabase Cloud (Recommended)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy project URL and anon key to `.env.local`
4. Run migrations:
```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

### Option 2: Local Development

```bash
npx supabase start
npx supabase db reset
```

## 🌍 Internationalization

The app supports multiple languages. To add a new language:

1. Add translations in `src/lib/i18n/locales/[language].json`
2. Update `src/lib/i18n/config.ts`
3. Test with language switcher

## 📱 PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Core features work without internet
- **Background Sync**: Queued actions sync when online
- **Push Notifications**: Weather alerts and price updates

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🚢 Deployment

### Vercel (Frontend + API)

1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Railway (Python Microservices)

1. Install Railway CLI: `npm install -g @railway/cli`
2. Deploy disease detection service:
```bash
cd services/disease-detector
railway login
railway init
railway up
```

## 📊 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Cache**: Upstash Redis
- **AI/ML**: Python FastAPI on Railway
- **PWA**: Workbox
- **State**: Zustand, TanStack Query
- **i18n**: i18next

## 🔐 Security

- All API keys stored in environment variables
- Row Level Security (RLS) on all Supabase tables
- HTTPS enforced by Vercel
- Rate limiting on API endpoints
- Signed URLs for file uploads

## 📖 Documentation

- [Product Requirements Document](./FarmFlow-PRD.md)
- [Technical Requirements Document](./FarmFlow_TRD_v1.1.md)
- [UX Architecture Specification](./FarmFlow-UX-Architecture-Spec.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Team

Built for smallholder farmers across Africa.

## 🆘 Support

For issues and questions, please open a GitHub issue or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: May 2026