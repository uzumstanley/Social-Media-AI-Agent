import { createLogger, format, transports } from "winston";
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { setup_HandleError } from "../utils";

// Ensure the logs directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Define log levels and their corresponding colors
const logLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue',
    },
};

// Custom function to format the timestamp
const customTimestamp = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds} ${ampm}`;
    return formattedTime;
};

// Function to get emojis based on log level
const getEmojiForLevel = (level : string) :string => {
    switch (level) {
        case 'info':
            return '💡'; // Light bulb for info
        case 'error':
            return '🚨'; // Emergency for errors
        case 'warn':
            return '⚠️'; // Warning for warnings
        case 'debug':
            return '🐞'; // Bug for debug
        default:
            return '🔔'; // Default bell emoji
    }
};

const logger = createLogger({
    levels: logLevels.levels,
    format: format.combine(
        format.timestamp({ format: customTimestamp }),
        format.colorize(),
        format.printf(({ timestamp, level, message }) => {
            const emoji = getEmojiForLevel(level);
            return `${timestamp} ${emoji} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            format: format.combine(
                format.colorize(),
                format.simple()
            ),
        }),
        new transports.DailyRotateFile({
            filename: "logs/%DATE%-combined.log",
            datePattern: "YYYY-MM-DD",
            level: "info",
            maxFiles: "14d", // Keep logs for the last 14 days
            maxSize: "20m", // Maximum log file size before rotation (20MB)
            zippedArchive: true, // Compress old log files
            format: format.combine(format.timestamp(), format.json()),
        }), // Daily rotating log file for general info
        new transports.DailyRotateFile({
            filename: "logs/%DATE%-error.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            maxFiles: "14d", // Keep logs for the last 14 days
            maxSize: "20m", // Maximum log file size before rotation (20MB)
            zippedArchive: true, // Compress old log files
            format: format.combine(format.timestamp(), format.json()),
        }), // Daily rotating error log
        new transports.DailyRotateFile({
            filename: "logs/%DATE%-debug.log",
            datePattern: "YYYY-MM-DD",
            level: "debug",
            maxFiles: "14d", // Keep logs for the last 14 days
            maxSize: "20m", // Maximum log file size before rotation (20MB)
            zippedArchive: true, // Compress old log files
            format: format.combine(format.timestamp(), format.json()),
        }), // Daily rotating debug log
    ],
});

// Catch unhandled promise rejections

export function setupErrorHandlers(): void {
    // Catch unhandled promise rejections
    process.on("unhandledRejection", (error: unknown) => {
        setup_HandleError(error, "Unhandled Rejection");
        process.exit(1);
    });

    // Catch uncaught exceptions
    process.on("uncaughtException", (error) => {
        setup_HandleError(error, "Uncaught Exception");
        process.exit(1);
    });

    // Catch process warnings
    process.on("warning", (warning) => {
        logger.warn(`Warning: ${warning.message || warning}`);
    });
}

export default logger;
