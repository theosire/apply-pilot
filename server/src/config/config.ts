// Loads and validates required env variables for server configuration
import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || '',
    jwtSecret: process.env.JWT_SECRET || '',
    clientUrl: process.env.CLIENT_URL || '',
    nodeEnv: process.env.NODE_ENV || 'development',
    emailUser: process.env.EMAIL_USER || '',
    emailPass: process.env.EMAIL_PASS || '',
    emailUser2: process.env.EMAIL_USER_2 || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
};

const required = [
    "mongoUri",
    "jwtSecret",
    "geminiApiKey",
    "clientUrl",
] as const;

required.forEach(key => {
    if (!config[key]) throw new Error(`Missing required env variable: ${key}`);
});

export default config;