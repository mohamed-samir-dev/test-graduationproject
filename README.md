# Next.js Attendance Management System

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── users/             # Users listing page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects to login)
├── components/            # React components
│   ├── features/          # Feature-specific components
│   │   └── users/         # User-related components
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── firebase/          # Firebase configuration
│   ├── services/          # API service layer
│   ├── types/             # TypeScript type definitions
│   └── constants/         # Application constants
└── public/                # Static assets
```

## Features

- **Authentication System**: Login with username/password and facial recognition
- **User Management**: View and search through user profiles
- **Attendance Tracking**: Camera-based attendance marking
- **Responsive Design**: Mobile-first responsive UI
- **TypeScript**: Full type safety throughout the application
- **Firebase Integration**: Real-time database for user data

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Custom Firebase authentication
- **Image Handling**: Next.js Image optimization

## Project Architecture

### Component Organization
- **Feature-based structure**: Components are organized by features (users, auth, etc.)
- **Reusable UI components**: Common components in `components/ui/`
- **Service layer**: Business logic separated into `lib/services/`

### Type Safety
- **TypeScript interfaces**: Defined in `lib/types/`
- **Strict typing**: All components and services are fully typed

### Firebase Integration
- **Configuration**: Centralized in `lib/firebase/config.ts`
- **Services**: Database operations abstracted in service layer

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.