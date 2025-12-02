import fs from "fs";
import mongoose from "mongoose";
import { User, Profile, Availability, Relationship } from "./database.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/swampstudy";

async function migrateData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Availability.deleteMany({});
    await Relationship.deleteMany({});
    console.log("Cleared existing collections");

    // Migrate Users
    if (fs.existsSync("./users.json")) {
      const users = JSON.parse(fs.readFileSync("./users.json", "utf-8"));
      if (Array.isArray(users) && users.length > 0) {
        await User.insertMany(users);
        console.log(`Migrated ${users.length} users`);
      }
    }

    // Migrate Profiles
    if (fs.existsSync("./profiles.json")) {
      const profilesData = JSON.parse(fs.readFileSync("./profiles.json", "utf-8"));
      const profiles = Object.entries(profilesData).map(([username, data]) => ({
        username,
        ...data
      }));
      if (profiles.length > 0) {
        await Profile.insertMany(profiles);
        console.log(`Migrated ${profiles.length} profiles`);
      }
    }

    // Migrate Availability
    if (fs.existsSync("./availability.json")) {
      const availabilityData = JSON.parse(fs.readFileSync("./availability.json", "utf-8"));
      const availabilities = Object.entries(availabilityData).map(([username, dates]) => ({
        username,
        dates: new Map(Object.entries(dates))
      }));
      if (availabilities.length > 0) {
        await Availability.insertMany(availabilities);
        console.log(`Migrated ${availabilities.length} availability records`);
      }
    }

    // Migrate Relationships
    if (fs.existsSync("./relationships.json")) {
      const relationshipsData = JSON.parse(fs.readFileSync("./relationships.json", "utf-8"));
      const relationships = Object.entries(relationshipsData).map(([username, data]) => ({
        username,
        pending: data.pending || [],
        friends: data.friends || []
      }));
      if (relationships.length > 0) {
        await Relationship.insertMany(relationships);
        console.log(`Migrated ${relationships.length} relationships`);
      }
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

migrateData();
