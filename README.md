# 🛍️ Shopee Clone - E-Commerce Platform

Full-stack e-commerce platform built with Next.js 16, Firebase, and TypeScript. Features separate dashboards for customers and sellers with complete shopping functionality.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Styling**: TailwindCSS v4 + shadcn/ui
- **Form Handling**: React Hook Form + Zod
- **State Management**: Context API
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel

## ✨ Features

### Authentication
- ✅ User registration with role selection (Customer/Seller)
- ✅ Login with email & password
- ✅ Form validation with Zod
- ✅ Auto-redirect based on user role

### Customer Features (In Progress)
- 🚧 Browse products
- 🚧 View product details
- 🚧 Add to cart
- 🚧 Manage cart (update quantity, remove items)
- 🚧 Purchase products
- 🚧 Order history

### Seller Features (In Progress)
- 🚧 Add new products
- 🚧 View own products
- 🚧 Filter & search products
- 🚧 Delete products
- 🚧 Product pagination

## 📁 Project Structure

```
shopee-clone/
├── app/                      # Next.js App Router
│   ├── login/               # Login page
│   ├── register/            # Register page
│   ├── dashboard/           # Customer dashboard (upcoming)
│   ├── seller/              # Seller pages (upcoming)
│   ├── layout.tsx           # Root layout with AuthProvider
│   └── page.tsx             # Landing page
├── lib/
│   ├── contexts/            # React Context (Auth)
│   ├── firebase/            # Firebase config & utilities
│   ├── types/               # TypeScript type definitions
│   ├── validations/         # Zod schemas
│   └── utils/               # Helper functions
├── components/              # Reusable components (upcoming)
└── __tests__/               # Jest test files

```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project created ([Firebase Console](https://console.firebase.google.com/))
- Git installed

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd shopee-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Firebase**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

Run unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

## 📚 Learning Resources

### Key Concepts Demonstrated

1. **Next.js 16 App Router**
   - Server & Client Components
   - File-based routing
   - Layout system

2. **Firebase Integration**
   - Authentication
   - Firestore database
   - Real-time listeners

3. **Form Handling Best Practices**
   - React Hook Form for performance
   - Zod for type-safe validation
   - Error handling

4. **State Management**
   - Context API for global state
   - Custom hooks pattern

5. **TypeScript**
   - Type safety
   - Interface definitions
   - Generics

## 🔐 Firebase Setup Guide

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create Firestore Database
5. Enable Storage
6. Copy configuration to `.env.local`

## 📝 Development Checklist

### Phase 1: Setup & Authentication ✅
- [x] Project initialization
- [x] Firebase configuration
- [x] Authentication Context
- [x] Login page
- [x] Register page
- [x] Form validation
- [x] Unit tests setup

### Phase 2: Customer Features (Next)
- [ ] Customer dashboard
- [ ] Product listing
- [ ] Product detail page
- [ ] Cart functionality
- [ ] Order placement
- [ ] Order history

### Phase 3: Seller Features
- [ ] Seller dashboard
- [ ] Product management (CRUD)
- [ ] Product filtering
- [ ] Image upload

### Phase 4: Polish & Deploy
- [ ] Unit tests for all features
- [ ] Error boundaries
- [ ] Loading states
- [ ] Deploy to Vercel

## 🤝 Contributing

This is a learning project for bootcamp. Feel free to explore and learn from the code structure!

## 📄 License

MIT License - feel free to use for learning purposes.

---

Built with ❤️ for learning purposes
