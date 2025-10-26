# Farm MRL Portal

A modern web application for managing antimicrobial residue levels (MRL) in livestock. This portal enables farmers and inspectors to track animal treatments, manage farm data, and ensure compliance with Maximum Residue Limits.

## Features

### User Management
- **Secure Authentication**: Registration and login system for farmers and inspectors
- **Role-Based Access**: Different permissions for farmers and inspectors

### Farm Management
- Register and manage farm details
- Track farm registration numbers and contact information
- Monitor total animal counts per farm

### Animal Inventory
- Add and track livestock with detailed information:
  - Tag numbers and identification
  - Species (cattle, sheep, goat, pig, poultry)
  - Breed, date of birth, and weight
  - Status tracking (active, quarantine, sold, deceased)

### Treatment Record Management
- Record detailed treatment information:
  - Medicine name and antimicrobial type
  - Dosage, unit, and administration details
  - Withdrawal periods and end dates
  - MRL levels and compliance status
- Automatic compliance status tracking (compliant, warning, violation, pending)
- Searchable and filterable treatment history

### Dashboard & Analytics
- Overview of key farm statistics:
  - Total animals across farms
  - Active treatments count
  - Compliance rate percentage
  - Violation and warning counts
- Visual data representations:
  - Antimicrobial usage trends over time
  - Compliance status distribution charts

### Report Management
- Upload compliance reports, inspection documents, and veterinary records
- Support for PDF, Excel (XLS/XLSX), and CSV formats
- File size limit: 10MB per upload
- Track uploaded reports by farm and type

### Compliance Reporting
- Export treatment records to CSV format
- Summary statistics by compliance status
- Detailed compliance breakdown

## Tech Stack

### Frontend
- **React** with **TypeScript**
- **Vite** for build tooling and development
- **Wouter** for client-side routing
- **TanStack Query** for data fetching and caching
- **shadcn/ui** component library
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads

### Database
- **PostgreSQL** (Neon-backed) for production
- In-memory storage option for development
- **Drizzle ORM** for database operations
- Type-safe schema definitions with **Zod**

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL database (or use in-memory storage for development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

The application uses in-memory storage by default. To use a PostgreSQL database:

1. Set up a PostgreSQL database
2. Configure database connection in your environment variables
3. Update the storage configuration in `server/storage.ts`

### Running the Application

Start the development server:
```bash
npm run dev
```

This will start:
- Express backend server
- Vite development server for the frontend
- The application will be accessible at the configured port

### User Roles

The application supports two user roles:

1. **Farmer**: Can manage their own farms, animals, and treatment records
2. **Inspector**: Can view and monitor compliance across multiple farms

## Project Structure

```
├── client/              # Frontend React application
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Application pages
│       ├── lib/         # Utility functions and configurations
│       └── hooks/       # Custom React hooks
├── server/              # Backend Express application
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Data storage interface
│   └── auth.ts          # Authentication logic
├── shared/              # Shared code between frontend and backend
│   └── schema.ts        # Database schema and type definitions
└── design_guidelines.md # UI/UX design specifications
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Farms
- `GET /api/farms` - Get all farms
- `POST /api/farms` - Create a new farm
- `GET /api/farms/:id` - Get a specific farm

### Animals
- `GET /api/animals` - Get all animals
- `POST /api/animals` - Add a new animal
- `GET /api/animals/:id` - Get a specific animal

### Treatment Records
- `GET /api/treatments` - Get all treatment records
- `POST /api/treatments` - Create a new treatment record
- `GET /api/treatments/:id` - Get a specific treatment record

### Reports
- `POST /api/upload` - Upload a farm report
- `GET /api/reports` - Get all uploaded reports

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/trends` - Get treatment trends data
- `GET /api/dashboard/compliance` - Get compliance distribution data

## Design Philosophy

The application follows a modern SaaS dashboard pattern inspired by Linear and Notion, prioritizing:
- **Data clarity**: Clear presentation of critical information
- **Efficient workflows**: Streamlined processes for common tasks
- **Role-based interfaces**: Tailored experiences for different user types
- **Responsive design**: Works seamlessly across devices

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes with middleware
- Input validation using Zod schemas
- File type and size validation for uploads

## Development Guidelines

- Follow TypeScript best practices
- Use the established component library (shadcn/ui)
- Maintain type safety between frontend and backend using shared schemas
- Follow the existing code style and conventions
- Add proper error handling and user feedback

## Testing

The application includes `data-testid` attributes on interactive elements for testing purposes.

## License

This project is proprietary software for farm management and MRL compliance tracking.



For issues, questions, or contributions, please contact the development team.
