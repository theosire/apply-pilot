// Mongoose schema for storing user account and profile information
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        resumeText: {
            type: String,
            default: "",
        },
        weeklyGoal: {
            type: Number,
            default: 10,
        },
        timezone: {
            type: String,
            default: "America/Toronto",
        },
        background: {
          currentTitle: {
            type: String,
            default: "",
          },
          yearsExperience: {
            type: Number,
            default: 0,
          },
          skills: {
            type: [String],
            default: [],
          },
          bio: {
            type: String,
            default: "",
          },
          targetRole: {
            type: String,
            default: "",
          },
          targetSalary: {
            type: Number,
            default: null,
          },
        },
    }, 
    { timestamps: true }
);

export const User = mongoose.model("User", userSchema);