<!-- Setting Up The Database -->

# Setting Up The Auto Blog Server

The Auto Blog Server makes use of various environment variables which you have to create accounts to get. The entire project heavily depends on the Nylas API and OpenAI API. As a requirement, you must create your accounts from both before you can start up the server.

<!-- **Note** Use an email for the entire process as it is required for the application to function properly. -->

- To create an account on the Nylas API, [go here](https://www.nylas.com/). Click on the `Build for free` button on the navbar. Follow the flow to the end. Once the account creation is complete, go to the `app setting` on the dashboard on the sidebar by the left. There you will get your `NYLAS_CLIENT_ID` and `NYLAS_CLIENT_SECRET`. You can copy them to your .env file.

To get your `NYLAS_ACCESS_TOKEN`, go to the Nylas Dashboard. Click on Accounts on the left, select the account you want to generate a token for, and click Generate a new token. if you don't see an account, then add a new one, let it be the email you signed up with. Then copy it to your .env file.

- To get an `OPENAI_API_KEY` and `OPENAI_ORGANIZATION_ID`, [go here](https://openai.com/). Create an account, click on the third option `API` in the dashboard. Click on the user icon at the top right corner of the navbar. Select `view API Keys`. Create a new secret key by clicking on `create new secret key`. Copy the key and add it to your .env file. Then click on `settings` under `Organization` and copy your Organization ID to the .env file.

- For your Database, make sure that postgresql database is installed and running locally. And also be sure it is running on port `5432` but if it is on another port, change the port on the `DATABASE_URL` to match.

- Finally, be sure that Nodejs is intalled with at at least a version of `>=16.13`

## Your environment secrets should look like the one below.

Don't forget to add your .env files to .gitignore to prevent leaking secret keys.

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

## Installing Node Dependencies

To install dependencies of application:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run start
# or
yarn start
# or
pnpm start
```

### HOW TO USE APPLICATION

To use this application is simple but detail oriented. So to understand how to use this application, watch the short video: [How To Use The Auto Blog AI App](https://www.nylas.com/)

### HOW THE APPLICATION WORKS

You might wonder what a particular code snippet does or how the application works, you can find a detailed walk through here: [How The Auto Blog AI App Works](https://www.nylas.com/)

<!-- ### Updating The Database Schema -->

<!-- Whenever the Prisma schema is updated, the database schema ia also updated using either `prisma migrate dev` or `prisma db push`. This will keep the database schema in sync with the Prisma schema. The commands will also regenerate Prisma Client. -->
