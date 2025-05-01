# Muhammed Tarik Ucar Website

This is the codebase for Muhammed Tarik Ucar's personal website and API.

## Project Structure

The project is divided into two main parts:

- **Client**: React frontend application
- **Server**: Node.js/Express backend API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/muhammedtarikucar.git
cd muhammedtarikucar
```

2. Install dependencies for both client and server:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
```bash
# In the server directory
cp .env.example .env
# Edit .env file with your configuration
```

4. Start the development servers:
```bash
# Start server in development mode
cd server
npm run dev

# Start client in development mode
cd ../client
npm run dev
```

## API Documentation

The API documentation is available at `/api-docs` when the server is running.

## Features

- User authentication with JWT
- Blog posts and events management
- User profiles
- Community features

## Technologies Used

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- Winston for logging
- Jest for testing
- Swagger for API documentation

### Frontend
- React
- Redux for state management
- React Router for routing
- Material Tailwind for UI components
- Framer Motion for animations
- React Query for data fetching

## Deployment

The application can be deployed using Docker:

```bash
docker build -t muhammedtarikucar .
docker run -p 5000:5000 muhammedtarikucar
```

## Testing

```bash
# Run server tests
cd server
npm test

# Run client tests
cd ../client
npm test
```

## License

This project is licensed under the ISC License.

## Contact

Muhammed Tarik Ucar - [website](https://muhammedtarikucar.com)
