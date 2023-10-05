const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAIAPI = require("openai");
const Nylas = require("nylas");
const { default: Draft } = require("nylas/lib/models/draft");
const { PrismaClient } = require("./prisma/generated/prisma-client-js");
const { formatEvents, formatDateString } = require("./utils");

// Configure environment variables to work in the application
require("dotenv").config();

// Instantiate Express
const app = express();

// Body Parser is required to parse payloads coming from the frontend.
app.use(bodyParser.urlencoded({ extended: false }));

// To access my credentials from .env file
const originUrl = process.env.ORIGIN_URL;

// To allow only a particular origin to access your server, create an object like the one below

let corsOptions = {
  origin: originUrl,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// To enable cross origin resource sharing
app.use(cors(corsOptions));

// If content-type for POST req is application/json, read the JSON body of the request, parse it and put it in req.body
app.use(express.json());

// Instantiate Prisma
const prisma = new PrismaClient();

// Configure Nylas API
Nylas.config({
  clientId: process.env.NYLAS_CLIENT_ID,
  clientSecret: process.env.NYLAS_CLIENT_SECRET,
});
const nylas = Nylas.with(process.env.NYLAS_ACCESS_TOKEN);

// Confiqure ChatGPT
const openai = new OpenAIAPI({
  organization: process.env.OPENAI_ORGANIZATION_ID,
  apiKey: process.env.OPENAI_API_KEY,
});

// This function handles everything about creating articles from events in the DB
const createArticlesFromEvents = async () => {
  // Get the events saved in the events table in the DB
  const allEventsFromDB = await prisma.events.findMany();

  // Get the articles saved in the articles table in the DB
  const allPostsFromDB = await prisma.articles.findMany();

  for (let index = 0; index < allEventsFromDB.length; index++) {
    const event = allEventsFromDB[index];

    // Remove the "AutoBlog Bot" prefix
    const title = event.title.split("").slice(13).join("");

    // Get image id to for image url
    const image_id = event.location.trim().split("").slice(32, 65).join("");

    // Construct image url
    const image_url = `https://drive.google.com/uc?export=view&id=${image_id}`;

    // Create a slug from the event title
    const slug = title.trim().toLowerCase().replace(/\s/g, "-");

    // Check if an post already exist in the DB by post_id

    const isPostInDB = allPostsFromDB.some(el => el.post_id === event.event_id);

    // console.log(isPostInDB);

    if (!isPostInDB) {
      // Generate the post
      const response = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `generate a blog post on the topic the topic: ${title} with code samples in mdx format`,
          },
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.2,
      });

      // Get the content from the response
      const content = response.choices[0].message.content;

      // Populate the Events Table in the DB with the event
      await prisma.articles.create({
        data: {
          slug: slug,
          title: title,
          description: event.description,
          url: image_url,
          content: content,
          post_id: event.event_id,
        },
      });
      // console.log("Post is added!");
    } else {
      // console.log("Post exists in DB!");
    }
  }
};

// This function handles everything about sending emails to the subscribers mail list
const sendEmailsToSubscribers = async () => {
  // Get the posts saved in the posts table in the DB
  const allSubscribersFromDB = await prisma.subscribers.findMany();

  // Get the articles saved in the articles table in the DB
  const allPostsFromDB = await prisma.articles.findMany();

  for (let index = 0; index < allPostsFromDB.length; index++) {
    const article = allPostsFromDB[index];

    // Get the title
    const title = article.title.trim();

    //Check if there are subscribers
    if (!article.notified) {
      if (allSubscribersFromDB.length !== 0) {
        // Generate email body
        const response = await openai.chat.completions.create({
          messages: [
            {
              role: "user",
              content: `Generate a message in not more than 50 words to inform users of a new blog post with the title: ${title}`,
            },
          ],
          model: "gpt-3.5-turbo",
          max_tokens: 50,
          temperature: 0.2,
        });

        // Get content of ChatGPT response
        const emailBody = response.choices[0].message.content;

        // Sent an email to each of the subscribers
        for (let index = 0; index < allSubscribersFromDB.length; index++) {
          let email = allSubscribersFromDB[index];

          // Create a new draft object
          try {
            const draft = new Draft(nylas, {
              to: [
                {
                  name: email.first_name + " " + email.last_name,
                  email: email.email,
                },
              ],
              subject: `New article release!, title: ${title}`,
              body: emailBody,
            });
            // Invoke the send function
            draft.send();

            // console.log(
            //   "Sent email to " + email.first_name + " " + email.last_name
            // );

            // Update the notified column to true to avoid sending notifications more than once
            await prisma.articles.update({
              where: {
                post_id: article.post_id,
              },
              data: {
                notified: true,
              },
            });
          } catch (error) {
            return {
              name: error.name,
              message: error.message,
            };
          }
        }
      } else {
        // console.log("No Subscribers yet");
      }
    } else {
      // console.log("Notification has been sent for this article");
    }
  }
};

// This function controls the queries and mutations that happens in the DB
const main = async () => {
  // Get the events saved in the events table in the DB
  const allEventsFromDB = await prisma.events.findMany();

  // console.log(allEventsFromDB);

  // Get all the events from the calender and filter with the prefix: "AutoBlog Bot"
  const allEvents = await nylas.events.list({ title: "AutoBlog Bot" });
  // console.log(allEvents);

  // Make sure array is not empty
  if (allEvents.length !== 0) {
    // Create a new array of objects so objects only keep the properties needed
    const allEventsFromCalender = formatEvents(allEvents);

    // Check if the records are in sync with DB. If a new event is added to the calender, add it to the DB
    for (let index = 0; index < allEventsFromCalender.length; index++) {
      // Get each event from the array so they can be checked if they're in the DB or not
      const event = allEventsFromCalender[index];

      // Check if an event already exist in the DB by event_id
      const isEventInDB = allEventsFromDB.some(
        el => el.event_id === event.event_id
      );

      // If it does not exist in the DB already, add it.
      if (!isEventInDB) {
        // Populate the Events Table in the DB with the event
        await prisma.events.create({
          data: {
            event_id: event.event_id,
            title: event.title,
            description: event.description,
            location: event.location,
            start_time: formatDateString(event.when.startTime),
            end_time: formatDateString(event.when.endTime),
          },
        });
        // console.log("Event is added!");
      } else {
        // console.log("Event exists in DB!");
      }
    }
  } else {
    // console.log("No Event in the Calender!");
  }

  // Function Create Articles From Events
  await createArticlesFromEvents();

  // Check to see if users has already been notified using `published`
  // Function Send Emails To Subscribers
  await sendEmailsToSubscribers();
};

// DB connection
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

// Endpoint to get all the articles
app.get("/articles", async (req, res) => {
  const allPostsFromDB = await prisma.articles.findMany();
  res.json(allPostsFromDB);
});

// Endpoint to get a single article
app.get("/articles/:id", async (req, res) => {
  let post_id = req.params.id;
  const article = await prisma.articles.findUnique({
    where: {
      post_id: post_id,
    },
  });
  res.json(article);
});

// Endpoint to delete an article
app.get("/articles/article/:id", async (req, res) => {
  try {
    let { id } = req.params;
    const article = await prisma.articles.delete({
      where: {
        id: Number(id),
      },
    });
    // console.log(`You have successfully removed article ${id}!`);
    res.json({
      message: `You have successfully removed article ${id}!`,
    });
  } catch (error) {
    res.status(404).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Endpoint for contact
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Create a new draft object
    const draft = new Draft(nylas, {
      to: [{ name: "Martins Ngene", email: "martinsngene.dev@gmail.com" }],
      subject: `New Message from:${name}, Email: ${email}`,
      body: message,
    });
    // Invoke the send function
    draft.send();
    // console.log("Message was successfully sent!");
    res.json({ message: "Message was successfully sent!" });
  } catch (error) {
    res.status(504).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Endpoint to subscribe to Newsletter
app.post("/subscribe", async (req, res) => {
  // Get subscriber's details from the client
  const { first_name, last_name, email } = req.body;

  // Check if subscriber exists in DB
  const allSubscribersFromDB = await prisma.subscribers.findMany({
    where: {
      email: email,
    },
  });

  // Add subscriber to DB
  if (allSubscribersFromDB.length === 0) {
    await prisma.subscribers.create({
      data: {
        first_name: first_name,
        last_name: last_name,
        email: email,
      },
    });
    // console.log(" You have successfully subscribed!");
    res.json({
      message: "You have successfully subscribed!",
    });
  }
  if (allSubscribersFromDB.length > 0) {
    // console.log("You are already subscribed!");
    res.json({
      message: "You are already subscribed!",
    });
  }
});

// Endpoint to unsubcribe
app.get("/unsubscribe/:id", async (req, res) => {
  try {
    let { id } = req.params;
    const deleteSubscriber = await prisma.subscribers.delete({
      where: {
        id: Number(id),
      },
    });
    // console.log(" You have successfully unsubscribed!");
    res.json({
      message: "You have successfully unsubscribed!",
    });
  } catch (error) {
    res.status(404).json({
      name: error.name,
      message: error.message,
    });
  }
});

// Server Setup
app.listen(process.env.PORT, () => {
  console.log("Server is running on PORT " + process.env.PORT);
});
