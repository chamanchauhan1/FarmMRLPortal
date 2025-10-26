# Farm MRL Portal - Project Structure

## New Organized Folder Structure

The codebase is now organized into separate, logical folders for better maintainability:

### frontend/ - All Frontend Code
Contains the complete React application with components, pages, hooks, and UI elements

### backend/ - Backend Server
Express.js server setup and configuration

### database/ - Database Layer
- schema/index.ts - All database table definitions and Zod schemas
- storage/index.ts - Data access layer with CRUD operations

### api/ - API Layer  
- routes/index.ts - All REST API endpoints
- middleware/auth.ts - Authentication and authorization

## Bridge Files (Compatibility)

To maintain compatibility with build tools:
- server/ → Re-exports from backend/ and api/
- shared/ → Re-exports from database/schema/
- client/ → Points to frontend/

Always edit files in the NEW structure (frontend/, backend/, database/, api/)

## Feature Locations

| Feature | Frontend | API | Database |
|---------|----------|-----|----------|
| Auth | login.tsx, register.tsx | /api/auth/* | users table |
| Farms | farms.tsx | /api/farms | farms table |
| Animals | animals.tsx | /api/animals | animals table |
| Treatments | treatments.tsx | /api/treatments | treatment_records |
| Reports | reports.tsx, upload.tsx | /api/reports | farm_reports |
| Dashboard | dashboard.tsx | /api/dashboard/* | All tables |

