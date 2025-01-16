import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet'; // For securing HTTP headers


import { runInstagram } from './client/Instagram';
import logger, { setupErrorHandlers } from './config/logger';
import { setup_HandleError } from './utils';
import { connectDB } from './config/db';
// import { main as twitterMain } from './client/Twitter'; //
// import { main as githubMain } from './client/GitHub'; // 


// Set up process-level error handlers
setupErrorHandlers();

// Initialize environment variables
dotenv.config();

const app: Application = express();


// Connect to the database
connectDB();



// Middleware setup
app.use(helmet({ xssFilter: true, noSniff: true })); // Security headers
app.use(express.json()); // JSON body parsing
app.use(express.urlencoded({ extended: true, limit: '1kb' })); // URL-encoded data
app.use(cookieParser()); // Cookie parsing


const runAgents = async () => {
    logger.info("Starting Instagram agent...");
    await runInstagram();
    logger.info("Instagram agent finished.");

    // logger.info("Starting Twitter agent...");
    // await twitterMain();
    // logger.info("Twitter agent finished.");

    // logger.info("Starting GitHub agent...");
    // await githubMain();
    // .log("GitHub agent finished.");
};



runAgents().catch(error => {
    setup_HandleError(error , "Error running agents:");
})



export default app;
