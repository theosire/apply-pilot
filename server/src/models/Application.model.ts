// Mongoose schema for tracking job applications and Kanban workflow state
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyDomain: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      default: "",
    },

    salaryMin: {
      type: Number,
      default: null,
    },

    salaryMax: {
      type: Number,
      default: null,
    },

    location: {
      type: String,
      default: "",
    },

    workType: {
      type: String,
      enum: ["remote", "hybrid", "onsite"],
      default: "remote",
    },

    status: {
      type: String,
      enum: [
        "Saved",
        "Applied",
        "Phone Screen",
        "Technical Interview",
        "Final Round",
        "Offer",
        "Rejected / Closed",
      ],
      default: "Saved",
    },

    // Position of the card inside its Kanban column
    columnOrder: {
      type: Number,
      default: 0,
    },

    jobDescription: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    coverLetter: {
      type: String,
      default: "",
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    // Timeline of changes made to this application
    activityLog: [
      {
        action: String,
        note: {
          type: String,
          default: "",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    dateApplied: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Application = mongoose.model("Application", applicationSchema);