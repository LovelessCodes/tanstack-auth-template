# 🚀 TanStack Auth Template
[![TanStack x Better Auth Template Demo Status Badge](https://kener.less.cx/badge/Demo_Project/status?labelColor=&color=&style=for-the-badge&label=TanStack%20x%20Better%20Auth%20Template%20-%20Demo)![TanStack x Better Auth Template Demo Status Badge 2](https://kener.less.cx/badge/Demo_Project/dot?animate=ping)](https://demo.less.cx)

A modern, full-stack authentication template built with TanStack, Better-Auth, and Drizzle ORM. This template provides a solid foundation for building secure, performant web applications with a focus on developer experience.

## ✨ Features

- **Authentication** - Complete auth solution with Better-Auth
- **Modern Stack** - Built with TanStack Start (React 19 + Vite)
- **Type-Safe** - Full TypeScript support
- **Styling** - Beautiful UI with TailwindCSS and ShadCN components
- **Database** - Type-safe database interactions with Drizzle ORM
- **Form Handling** - React Hook Form with Zod validation
- **State Management** - Zustand for global state
- **Animations** - Smooth animations with Framer Motion
- **Code Quality** - Pre-configured with Biome for formatting and linting
- **CI/CD** - GitHub Actions workflow included

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19 + Vite)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) + [ShadCN](https://ui.shadcn.com/)
- **Database**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better-Auth](https://better-auth.js.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [ShadCN](https://ui.shadcn.com/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Code Quality**: [Biome](https://biomejs.dev/)

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or later)
- [Node.js](https://nodejs.org/) (v18 or later)
- [Git](https://git-scm.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/tanstack-auth-template.git
   cd tanstack-auth-template
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update the .env file with your configuration
   ```

4. Run database migrations:
   ```bash
   bun run generate
   bun run push
   ```

5. Start the development server:
   ```bash
   bun run dev
   ```

6. Open [http://localhost:4005](http://localhost:4005) in your browser.

## 🏗 Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   ├── lib/           # Utility functions and configurations
│   ├── routes/        # Application routes
│   ├── styles/        # Global styles and Tailwind config
│   └── types/         # TypeScript type definitions
├── drizzle/           # Database migrations and schema
├── public/            # Static assets
└── tests/             # Test files
```

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TanStack](https://tanstack.com/) for amazing developer tools
- [ShadCN](https://ui.shadcn.com/) for beautiful components
- [Better-Auth](https://better-auth.js.org/) for authentication
- The open-source community for continuous inspiration
