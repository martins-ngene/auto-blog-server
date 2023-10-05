<!-- Setting Up The Database -->

### Setting Up The Database Locally with Prisma Migrate

To setup the database locally, you need to have PostgreSQL and Nodejs installed. Make sure your PostgreSQL server is running locally and check to see that the database url is loading correctly from your .env file.

Run `npx prisma migrate dev --name init` to create the database and the tables it contains.

This command will creates a new SQL migration file and run the SQL migration file against the database

### Updating The Database Schema

Whenever the Prisma schema is updated, the database schema ia also updated using either `prisma migrate dev` or `prisma db push`. This will keep the database schema in sync with the Prisma schema. The commands will also regenerate Prisma Client.
# auto-blog-server
