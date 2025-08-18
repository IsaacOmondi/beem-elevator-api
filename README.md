# Elevator API - Quick Setup Guide
A lean elevator management system API built with Node.js, Express, Sequelize and PostgreSQL.

## Prerequisites
- Node.js (v20 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

## Quick Start
### 1. Clone and install
```bash
git clone git@github.com:IsaacOmondi/beem-elevator-api.git
cd beem-elevator-api
npm install
```
### 2. Database Setup
Create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE elevator;

# Exit
\q
```
### 3. Environment Configuration
Create a `.env` file in the root directory:

```bash
# Copy Example environment file to your new .env
cp .env.example .env
```

In your .env file change the values on `DB_USER` and `DB_PASS` to your configuration

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=elevator_db
DB_USER=postgres
DB_PASS=your_password
DB_DIALECT=postgres

# Server
PORT=3000
NODE_ENV=development
```

### 4. Setup Database Schema

```bash
# Run migrations to create tables
npm run db:migrate

# Seed with demo data
npm run db:seed
```

### 5. Start the Server

```bash
# Start development server
npm run dev

# Or start production server
npm start
```


## Troubleshooting

### Database Connection Error:
```bash
# Check PostgreSQL is running
brew services start postgresql  # Mac
sudo service postgresql start   # Linux

# Verify database exists
psql -U postgres -l | grep elevator_db
```

### Server Won't Start:
```bash
# Check if port is already in use
lsof -i :3000

# Use different port
PORT=3001 npm run dev
```

### Migration Errors:
```bash
# Reset database if needed
npm run db:reset
```