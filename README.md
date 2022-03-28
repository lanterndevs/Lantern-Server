# Lantern

Lantern is a free, open source web-application that gives small businesses the ability to track and account all income/cash flow along with providing computed detailed reports and finanical analysis.

## Lantern-Server

This repository contains code for the backend server of the project.

### Quickstart Instructions

To install and start the server for personal use, first ensure you have the latest version of the node package manager [npm](https://www.npmjs.com/).  Then, run the following command in the root of the repository:

```
npm install
```

This will install all dependencies for the project locally.  We will then need to create a .env file in the root of the repository to provide critical environment variables to the server.  To do this, make a copy of `.envexample` and rename it `.env`.  Replace the values with your own corresponding values and save your changes.

To then start up a development server, run the following command in the root of the repository:

```
npm start
```

This will spin up an express server instance in your local terminal.  Your local Lantern frontend should now be able to talk to the backend to enable full functionality!
