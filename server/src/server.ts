// Connects to MongoDB and starts the Express server
import mongoose from "mongoose";
import app from "./app";
import config from "./config/config";

const startServer = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('MongoDB connected');

        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();