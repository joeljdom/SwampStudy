import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/swampstudy";

console.log("Testing MongoDB connection...");
console.log("URI:", MONGODB_URI);

try {
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });
  console.log("✓ Successfully connected to MongoDB");
  
  // Test a simple query
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log("✓ Collections:", collections.map(c => c.name));
  
  await mongoose.disconnect();
  console.log("✓ Disconnected");
} catch (error) {
  console.error("✗ MongoDB connection failed:");
  console.error("Error:", error.message);
  console.error("Code:", error.code);
  process.exit(1);
}
