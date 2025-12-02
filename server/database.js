import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/swampstudy";

// Connect to MongoDB
export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

export const User = mongoose.model("User", userSchema);

// Profile Schema
const profileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  classes: { type: [String], required: true },
  studyPreference: { type: String, required: true },
  academicYear: { type: String, default: "unknown" },
  studyGoal: { type: [String], default: [] },
  studyFrequency: { type: String, default: "unknown" }
});

export const Profile = mongoose.model("Profile", profileSchema);

// Availability Schema
const availabilitySchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  dates: { type: Map, of: String, default: {} }
});

export const Availability = mongoose.model("Availability", availabilitySchema);

// Relationships Schema
const relationshipSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  pending: { type: [String], default: [] },
  friends: { type: [String], default: [] }
});

export const Relationship = mongoose.model("Relationship", relationshipSchema);

// Message Schema for Direct Messages
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

export const Message = mongoose.model("Message", messageSchema);
