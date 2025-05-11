# StudyDrop Humanizer

A text humanization tool that uses AI to make machine-generated content sound more human. Available at [Studydrop.io](https://studydrop.io). This project is a clone of [NaturalWrite](https://naturalwrite.com/) with a focus on the text humanization feature.

## Features

- Text humanization using AI
- User authentication with Supabase Auth
- User management with Supabase
- Subscription tiers with Stripe
- Responsive, modern UI with Tailwind CSS

## Tech Stack

- **Frontend Framework**: Next.js 14
- **UI Library**: Tailwind CSS with shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Payments**: Stripe
- **AI**: OpenAI

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/studydrop-humanizer.git
cd studydrop-humanizer
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Email (for Supabase Auth)
EMAIL_SERVER_HOST=your-email-host
EMAIL_SERVER_PORT=your-email-port
EMAIL_SERVER_USER=your-email-user
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=your-email-from
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
studydrop-humanizer/
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js app directory
│   │   ├── api/        # API routes
│   │   ├── auth/       # Authentication pages
│   │   ├── dashboard/  # Dashboard pages
│   │   ├── pricing/    # Pricing page
│   ├── components/     # React components
│   ├── lib/            # Utility functions and shared code
```

## Authentication

The application uses Supabase Auth for authentication with the following providers:

- Email/Password (Magic Link)
- Google
- GitHub

To configure these providers, you'll need to set up the corresponding OAuth applications and add their credentials to your Supabase project.

## Subscription Management

- Free tier: Limited to 3 humanizations per day
- Pro tier: Unlimited humanizations with enhanced quality
- Premium tier: Unlimited humanizations with advanced features

## Development

### Database Schema

The Supabase database includes the following tables:
- Users
- Subscriptions
- Usage

### API Routes

- `/api/stripe`: Handles Stripe checkout session creation
- `/auth/callback`: Handles Supabase authentication callbacks

## Deployment

### Deploy to Vercel

```