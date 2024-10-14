## Overview

Kronos is a productivity app that helps users organize their tasks into specific categories that align with Maslow’s hierarchy of needs. By categorizing tasks based on necessity and motivation, Kronos offers an innovative approach to prioritizing tasks and improving time management.

## Table of Contents

1. Features
2. Tech Stack
3. Demo
4. Installation
5. Database Setup
6. Running the App
7. Deployment
8. Seeding the Database
9. Environment Variables
10. Contributing
11. License

## Features

- Task categorization based on mindsets, inspired by Maslow’s hierarchy of needs.
- Automatic task organisation using set rules (in progress).
- Calendar component built on the HexaFlexa library.
- Real-time synchronization of tasks across devices.
- Framer Motion animations for a sleek and smooth user interface.
- Database persistence with PostgreSQL.
- Dynamic task management through a drag-and-drop interface.

## Tech Stack

- Frontend: React.js, Next.js, Tailwind CSS
- Backend: Node.js, Express.js
- Database: PostgreSQL (hosted on Vercel for production)
- ORM: Prisma
- Animations: Framer Motion


## Demo

You can demo Kronos at https://kronos-web-umber.vercel.app/


## Installation

1. Clone the repository:

    git clone https://github.com/yourusername/kronos.git
    cd kronos


2. Install dependencies:

    npm install


3. Set up your environment variables. Create .env files for local development and production.


### Database Setup

Local PostgreSQL with Docker

1. Start your local PostgreSQL instance using Docker:

    docker run --name kronos-db -e POSTGRES_USER=yourusername -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=kronos -p 5432:5432 -d postgres


2. Set up your local .env file for the database:

    DATABASE_URL="postgres://yourusername:yourpassword@localhost:5432/kronos"


### Vercel PostgreSQL

If you’re using Vercel’s hosted PostgreSQL:

1. Pull the environment variables for Vercel using:

    vercel pull


2. This will generate a .env.development.local file containing your Vercel PostgreSQL credentials.


### Running the App

Local Development

1. Start the development server:

    npm run dev

2. Open your browser at http://localhost:3000 to see the app.

Production Build

1. Build the production bundle:

    npm run build


2. Start the production server:

    npm run start



### Deployment

Vercel

1. Install the Vercel CLI:

    npm install -g vercel


2. Link your project to Vercel:

    vercel link


3. Deploy to Vercel:

    vercel --prod



## Seeding the Database

To seed your Vercel database, ensure your environment variables are properly set up. Run the following command to seed:

npm run seed

Make sure your Prisma schema and seed scripts are correctly configured to populate the tables.


## Environment Variables

Here are the environment variables that Kronos uses:

- DATABASE_URL - The connection string for your PostgreSQL database.
- NEXTAUTH_URL - The URL of the application for authentication.
- NEXTAUTH_SECRET - The secret used for NextAuth.js authentication.

### Example .env File

DATABASE_URL=postgres://yourusername:yourpassword@localhost:5432/kronos
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

For production, .env.development.local will be generated via vercel pull for Vercel’s deployment environment.


## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature: git checkout -b feature-name.
3. Make your changes and commit them: git commit -m "Add feature name".
4. Push the changes to your branch: git push origin feature-name.
5. Create a pull request and describe your changes.


## License

This project is licensed under the MIT License.