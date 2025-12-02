import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Message Schema for Direct Messages
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const Message = mongoose.model("Message", messageSchema);

console.log("Testing Message operations...");
console.log("URI:", MONGODB_URI);

try {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB");

  // Count messages
  const count = await Message.countDocuments();
  console.log(`✓ Total messages in DB: ${count}`);

  if (count > 0) {
    // Get first message
    const firstMsg = await Message.findOne().lean();
    console.log("✓ Sample message:", JSON.stringify(firstMsg, null, 2));

    // Try fetching a conversation
    const username = "testuser";
    const otherUsername = "otheruser";
    
    const messages = await Message.find({
      $or: [
        { sender: username, receiver: otherUsername },
        { sender: otherUsername, receiver: username }
      ]
    }).sort({ timestamp: 1 }).lean();

    console.log(`✓ Messages for ${username} with ${otherUsername}:`, messages.length);
  }

  await mongoose.disconnect();
  console.log("✓ Disconnected");
} catch (error) {
  console.error("✗ Error:", error.message);
  process.exit(1);
}
