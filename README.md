# 🏃‍♂️ Applied Sports Science Lab App

A modern, full-stack web application for managing athlete performance testing in a sports science lab environment. The app supports submaximal lactate threshold testing across multiple exercise modalities with a focus on data accuracy, visualization, and user experience.

## Tech Stack

- **Frontend**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **Charts**: Chart.js + Recharts
- **Testing**: Jest + React Testing Library

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myra_sports_lab?schema=public"
   NEXTAUTH_SECRET="your-nextauth-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Features

### Authentication & User Management
- Role-based access control (Athlete, Coach, Admin)
- Secure password handling
- Session management
- Profile management

### Coach Features
- Athlete management
- Test protocol creation
- Schedule management
- Performance analysis
- Notes and feedback system

### Athlete Features
- Pre-test assessment
- Real-time test data entry
- Performance tracking
- Schedule viewing
- Coach communication

### Testing System
- Multi-stage test protocols
- Real-time data entry
- Data validation
- Performance visualization
- Historical data analysis

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write unit tests for new features

### Git Workflow
1. Create feature branches from `main`
2. Use conventional commits
3. Submit PRs for review
4. Squash merge to main

### Testing
- Write unit tests with Jest and React Testing Library
- Test components in isolation
- Test API routes
- Run E2E tests for critical flows

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
