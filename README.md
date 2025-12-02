# MonoLife - Money Manager

A modern, beautifully designed personal finance management application built with React, Vite, and Supabase.

## Features (v1 MVP - In Progress)

- **Authentication**: Secure signup, login, password reset with email/password and Google OAuth
- **Wallets**: Manage multiple accounts (bank, credit card, cash, UPI, investments)
- **Categories**: Organize expenses and income with customizable categories
- **Transactions**: Track all your spending and income with detailed logs
- **Dashboard**: Get comprehensive insights into your financial health
- **Reports**: Visualize spending patterns, income vs expenses, category breakdowns
- **Dark Industrial Theme**: Beautiful, modern UI with Syne and Manrope typography

## Tech Stack

- **Frontend**: React 19 + Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Vanilla CSS with custom design system
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account ([create one here](https://supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   cd zenithly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings → API
   - Copy your project URL and anon/public key

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Set up database schema**
   
   Go to the SQL Editor in your Supabase dashboard and run the schema from `implementation_plan.md` (Section 13: Supabase Database Schema). This will create:
   - `users` table
   - `wallets` table
   - `categories` table
   - `transactions` table
   - Row-level security policies

6. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # Base UI components (Button, Input, Card, etc.)
│   └── auth/         # Authentication components
├── pages/            # Page components
│   ├── auth/         # Auth pages (Login, SignUp, ForgotPassword)
│   ├── wallets/      # Wallet management
│   ├── categories/   # Category management
│   ├── transactions/ # Transaction management
│   └── reports/      # Reports and analytics
├── stores/           # Zustand state stores
├── services/         # API service layers
├── lib/              # Library configurations (Supabase)
├── styles/           # Global styles and design tokens
└── utils/            # Utility functions
```

## Design System

The app uses a custom **Dark Industrial** design system with:
- **Colors**: Dark theme with Acid Green (#c6ff00) accents
- **Typography**: 
  - Display: Syne (headings)
  - Body: Manrope (content)
- **Components**: Fully customizable, theme-aware components
- **Responsive**: Mobile-first, works on all devices

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Project setup and dependencies
- [x] Design system and core UI components  
- [x] Supabase configuration
- [x] Authentication pages (Login, SignUp, Password Reset)
- [x] Routing setup

### Phase 2: Core Modules (In Progress)
- [ ] Onboarding wizard
- [ ] Wallets CRUD
- [ ] Categories CRUD
- [ ] Transactions CRUD
- [ ] Icon library

### Phase 3: Dashboard & Reports
- [ ] Home dashboard
- [ ] Net income report
- [ ] Expense details report
- [ ] Charts and visualizations

### Phase 4: Polish & Deploy
- [ ] Responsive design refinements
- [ ] Performance optimization
- [ ] Testing
- [ ] Production deployment

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT

---

Built with ❤️ using React + Vite + Supabase
