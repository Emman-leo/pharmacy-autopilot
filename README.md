# Pharmacy Management System

A production-ready pharmacy management system built with Node.js, Express, Supabase, and React.

## Features

- **Inventory Management**: Track drugs, batches, expiry dates, and stock levels
- **Point of Sale**: Cart-based checkout with automatic FEFO batch selection
- **Prescription Management**: Prescription entry with safety checks and approval workflow
- **Reporting**: Sales summaries, top-selling drugs, and expiry alerts
- **Role-based Access**: Admin and Staff roles with proper permissions
- **Security**: Row Level Security (RLS) enforced at database level

## Tech Stack

### Backend
- Node.js + Express
- Supabase (PostgreSQL)
- JWT Authentication
- Row Level Security

### Frontend
- React 18
- React Router
- Tailwind CSS
- Responsive Design

## Prerequisites

- Node.js 16+
- Supabase Account
- PostgreSQL database (via Supabase)

## Setup Instructions

### 1. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. In the Supabase SQL editor, run the scripts in order:
   - `supabase/schema.sql` - Creates all tables and relationships
   - `supabase/rls-policies.sql` - Sets up Row Level Security policies

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your Supabase credentials:
# DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
# SUPABASE_URL=https://[PROJECT_REF].supabase.co
# SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
# JWT_SECRET=your-super-secret-jwt-key

npm run dev
```

The backend will start on http://localhost:3001

### 3. Frontend Setup

```bash
cd frontend
# Install dependencies (if npm works, otherwise manual installation)
npm install

# Start development server
npm run dev
```

The frontend will start on http://localhost:5173

## Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Database
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Supabase Project
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]

# Application
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout user

### Inventory
- `GET /api/inventory/drugs` - Get all drugs
- `POST /api/inventory/drugs` - Create new drug
- `PUT /api/inventory/drugs/:id` - Update drug
- `DELETE /api/inventory/drugs/:id` - Delete drug
- `GET /api/inventory/batches` - Get inventory batches
- `POST /api/inventory/batches` - Add new batch
- `GET /api/inventory/alerts` - Get stock alerts

### Sales
- `POST /api/sales/checkout` - Process sale with cart
- `GET /api/sales/history` - Get sales history
- `GET /api/sales/receipt/:id` - Get sale receipt

### Prescriptions
- `POST /api/prescriptions` - Create new prescription
- `GET /api/prescriptions/pending` - Get pending prescriptions
- `PUT /api/prescriptions/:id/approve` - Approve prescription
- `PUT /api/prescriptions/:id/reject` - Reject prescription

### Reports
- `GET /api/reports/sales-summary` - Get sales summary
- `GET /api/reports/top-selling` - Get top selling drugs
- `GET /api/reports/expiry-alerts` - Get expiry alerts

## User Roles

### Admin
- Full access to all features
- Can manage users
- Can approve/reject prescriptions
- Access to all reports

### Staff
- Manage inventory
- Process sales
- Create prescriptions (requires admin approval for flagged cases)
- View reports

## Security Features

- **Row Level Security (RLS)**: Enforced at database level
- **JWT Authentication**: Token-based authentication
- **Role-based Access Control**: Different permissions for admin/staff
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries

## Business Logic

### FEFO (First Expiry, First Out)
- Automatic batch selection based on expiry dates
- Ensures oldest expiring stock is sold first
- Integrated into the sales checkout process

### Safety Checks
- Dosage limit validation
- Drug interaction checking
- Controlled drug special handling
- Admin approval workflow for flagged prescriptions

### Alerts
- Low stock notifications
- Expiry warnings (configurable thresholds)
- Automatic dashboard indicators

## Development

### Project Structure
```
pharmacy-autopilot/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   └── App.jsx
│   └── vite.config.js
└── supabase/
    ├── schema.sql
    └── rls-policies.sql
```

## Testing

Run the backend tests:
```bash
cd backend
npm test
```

## Deployment

### Backend (to render.com or similar)
1. Push code to GitHub
2. Create new web service on Render
3. Set environment variables
4. Deploy

### Frontend (to Netlify or Vercel)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables if needed

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue on GitHub or contact the development team.