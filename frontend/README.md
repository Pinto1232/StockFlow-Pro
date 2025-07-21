# StockFlow Pro Frontend

A modern React frontend application for the StockFlow Pro inventory management system, built with TypeScript, Vite, and Tailwind CSS.

## Features

- **Modern React 19** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **React Router** for client-side routing
- **TanStack Query** for server state management
- **Axios** for API communication
- **Lucide React** for beautiful icons
- **Role-based access control** with protected routes
- **Responsive design** that works on all devices

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   └── Layout/         # Layout components (Header, Sidebar, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── Auth/           # Authentication pages
│   ├── Dashboard/      # Dashboard page
│   ├── Products/       # Product management pages
│   ├── Users/          # User management pages
│   └── ...
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and configure it:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your backend API URL:
   ```
   VITE_API_BASE_URL=https://localhost:7001/api
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run clean` - Clean build artifacts

## API Integration

The frontend communicates with the StockFlow Pro .NET backend API. The API service layer is organized as follows:

- `services/api.ts` - Base API configuration with Axios
- `services/authService.ts` - Authentication endpoints
- `services/userService.ts` - User management endpoints
- `services/productService.ts` - Product management endpoints

### Authentication

The application uses JWT tokens for authentication:
- Tokens are stored in localStorage
- Automatic token refresh on API calls
- Protected routes redirect to login when unauthenticated

## State Management

- **TanStack Query** for server state (API data, caching, synchronization)
- **React hooks** for local component state
- **Context API** for global application state (if needed)

## Styling

The application uses Tailwind CSS with a custom design system:
- Primary color palette based on blue tones
- Custom component classes defined in `index.css`
- Responsive design with mobile-first approach
- Dark mode support (can be added)

## User Roles

The application supports three user roles:
- **Admin** - Full system access
- **Manager** - Elevated privileges with reporting access
- **User** - Basic system access

Role-based navigation and feature access are implemented throughout the application.

## Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow React best practices and hooks patterns
- Use functional components with hooks
- Implement proper error handling
- Write meaningful component and function names

### API Integration
- Use React Query hooks for data fetching
- Implement proper loading and error states
- Cache data appropriately
- Handle API errors gracefully

### Styling
- Use Tailwind CSS utility classes
- Create reusable component classes when needed
- Maintain consistent spacing and typography
- Ensure responsive design

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the development guidelines
3. Test your changes thoroughly
4. Submit a pull request with a clear description

## License

This project is part of the StockFlow Pro inventory management system.