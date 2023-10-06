<!-- Setting Up The Database -->

# Setting Up The Auto Blog Server

The Auto Blog Server makes use of various environment variables which you have to create accounts to get. The entire project heavily depends on the Nylas API and OpenAI API. As a requirement, you must create your accounts from both before you can start up the server.

```.env
    # OPENAI APIs Credentials
    OPENAI_API_KEY= YOUR OPEN AI API KEY
    OPENAI_ORGANIZATION_ID=YOUR OPEN AI ORGANIZATION ID

    # LocalHost Connection Port
    PORT=9000

    # Frontend ORIGIN URL
    ORIGIN_URL=http://localhost:3000


    # Nylas APIs Credentials
    NYLAS_ACCESS_TOKEN=YOUR NYLAS ACCESS TOKEN
    NYLAS_CLIENT_ID=YOUR NYLAS CLIENT ID
    NYLAS_CLIENT_SECRET=YOUR NYLAS CLIENT SECRET

    # Database Connection
    DATABASE_URL=postgresql://<your db username>:<your db password>@localhost:5432/autoblog?schema=public
```

### Setting Up The Database Locally with Prisma Migrate

To setup the database locally, you need to have PostgreSQL and Nodejs installed. Make sure your PostgreSQL server is running locally and check to see that the database url is loading correctly from your .env file.

Run `npx prisma migrate dev --name init` to create the database and the tables it contains.

This command will creates a new SQL migration file and run the SQL migration file against the database

<!-- ### Updating The Database Schema -->

<!-- Whenever the Prisma schema is updated, the database schema ia also updated using either `prisma migrate dev` or `prisma db push`. This will keep the database schema in sync with the Prisma schema. The commands will also regenerate Prisma Client. -->
