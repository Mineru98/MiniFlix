# Miniflix Installation Script for Windows PowerShell

Write-Host "Starting Miniflix installation..." -ForegroundColor Green

# Install packages
Write-Host "Installing packages..." -ForegroundColor Yellow
yarn install

# Create directory structure
Write-Host "Creating basic directory structure..." -ForegroundColor Yellow
if (!(Test-Path "packages\backend\src")) {
    New-Item -ItemType Directory -Path "packages\backend\src" -Force | Out-Null
}
if (!(Test-Path "packages\frontend\app")) {
    New-Item -ItemType Directory -Path "packages\frontend\app" -Force | Out-Null
}

# Create environment files
Write-Host "Creating environment files..." -ForegroundColor Yellow
$backendEnv = @"
PORT=4000
LOG_LEVEL=info
"@
Set-Content -Path "packages\backend\.env" -Value $backendEnv

# Create basic source files
Write-Host "Creating basic source files..." -ForegroundColor Yellow

# Backend index.ts
$backendIndex = @"
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import pino from 'pino';
import expressPino from 'express-pino-logger';

// Environment variables
dotenv.config();

// Logger setup
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });

// Express app
const app = express();

// Middleware
app.use(expressLogger);
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running' });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
"@
Set-Content -Path "packages\backend\src\index.ts" -Value $backendIndex

Write-Host "Installation completed!" -ForegroundColor Green
Write-Host "Run development server with: yarn dev" -ForegroundColor Cyan 