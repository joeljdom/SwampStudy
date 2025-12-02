import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { User, Profile, Availability, Relationship, Message } from "./database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Simple request logger to help debugging incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
// Enable CORS for all requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ============ USER ROUTES ============

// Hash password using SHA-256
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// signup route
app.post("/api/signup", async (req, res) => {
  try {
    const username = (req.body?.username || "").trim();
    const password = (req.body?.password || "").trim();

    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });

    const existingUser = await User.findOne({ username: { $regex: `^${username}$`, $options: "i" } });
    if (existingUser) {
      return res.status(409).json({ error: "username already exists" });
    }

    const user = new User({ username, password });
    await user.save();
    res.json({ ok: true, username });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// login route
app.post("/api/login", async (req, res) => {
  try {
    const username = (req.body?.username || "").trim();
    const password = (req.body?.password || "").trim();

    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });

    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    res.json({ ok: true, username });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============ AVAILABILITY ROUTES ============

// Get user's availability
app.get("/api/availability/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const availability = await Availability.findOne({ username });
    const userAvailability = availability?.dates || {};
    res.json(Object.fromEntries(userAvailability));
  } catch (error) {
    console.error("Get availability error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Save user's availability for a date
app.post("/api/availability/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const { date, status } = req.body;

    if (!date || !status) {
      return res.status(400).json({ error: "date and status required" });
    }

    if (status !== "available" && status !== "unavailable") {
      return res.status(400).json({ error: "status must be 'available' or 'unavailable'" });
    }

    let availability = await Availability.findOne({ username });
    if (!availability) {
      availability = new Availability({ username, dates: {} });
    }

    availability.dates.set(date, status);
    await availability.save();

    res.json({ ok: true, availability: Object.fromEntries(availability.dates) });
  } catch (error) {
    console.error("Save availability error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============ PROFILE ROUTES ============

// Get user's profile
app.get("/api/profile/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const profile = await Profile.findOne({ username });
    res.json(profile || null);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Save/update user's profile
app.post("/api/profile/:username", async (req, res) => {
  try {
    const username = req.params.username;
    let { classes, studyPreference, academicYear, studyGoal, studyFrequency } = req.body;
    console.log('Received profile POST:', req.body);

    if (!username || !classes || !Array.isArray(classes) || !studyPreference) {
      return res.status(400).json({ error: "username, classes (array), and studyPreference required" });
    }

    if (!academicYear) academicYear = "unknown";
    if (!studyGoal) studyGoal = [];
    if (typeof studyGoal === 'string') {
      studyGoal = [studyGoal];
    }
    if (!Array.isArray(studyGoal)) {
      studyGoal = [];
    }
    if (!studyFrequency) studyFrequency = "unknown";

    let profile = await Profile.findOne({ username });
    if (!profile) {
      profile = new Profile({ username, classes, studyPreference, academicYear, studyGoal, studyFrequency });
    } else {
      profile.classes = classes;
      profile.studyPreference = studyPreference;
      profile.academicYear = academicYear;
      profile.studyGoal = studyGoal;
      profile.studyFrequency = studyFrequency;
    }

    await profile.save();
    console.log('Writing profile:', profile);
    res.json({ ok: true, profile });
  } catch (error) {
    console.error("Save profile error:", error.message || error);
    console.error("Stack:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all profiles for matching
app.get("/api/profiles", async (req, res) => {
  try {
    const profiles = await Profile.find();
    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.username] = {
        classes: profile.classes,
        studyPreference: profile.studyPreference,
        academicYear: profile.academicYear,
        studyGoal: profile.studyGoal || [],
        studyFrequency: profile.studyFrequency
      };
    });
    res.json(profileMap);
  } catch (error) {
    console.error("Get profiles error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ============ RELATIONSHIPS ROUTES ============

// Get pending requests for a user
app.get("/api/relationships/pending/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const relationship = await Relationship.findOne({ username });
    const pending = relationship?.pending || [];
    res.json({ pending });
  } catch (error) {
    console.error("Get pending error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get friends for a user
app.get("/api/relationships/friends/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const relationship = await Relationship.findOne({ username });
    const friends = relationship?.friends || [];
    res.json({ friends });
  } catch (error) {
    console.error("Get friends error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Send a friend request (add to pending)
app.post("/api/relationships/request", async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({ error: "from and to usernames required" });
    }
    if (from === to) {
      return res.status(400).json({ error: "cannot add yourself" });
    }

    let relationship = await Relationship.findOne({ username: to });
    if (!relationship) {
      relationship = new Relationship({ username: to, pending: [], friends: [] });
    }

    // Check if already pending or friends
    if (relationship.pending.includes(from)) {
      return res.status(400).json({ error: "request already pending" });
    }
    if (relationship.friends.includes(from)) {
      return res.status(400).json({ error: "already friends" });
    }

    // Add to pending
    relationship.pending.push(from);
    await relationship.save();

    res.json({ ok: true });
  } catch (error) {
    console.error("Send request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Accept a friend request
app.post("/api/relationships/accept", async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({ error: "from and to usernames required" });
    }

    let toRelationship = await Relationship.findOne({ username: to });
    let fromRelationship = await Relationship.findOne({ username: from });

    if (!toRelationship) {
      toRelationship = new Relationship({ username: to, pending: [], friends: [] });
    }
    if (!fromRelationship) {
      fromRelationship = new Relationship({ username: from, pending: [], friends: [] });
    }

    // Remove from pending
    toRelationship.pending = toRelationship.pending.filter(u => u !== from);

    // Add to friends (both directions)
    if (!toRelationship.friends.includes(from)) {
      toRelationship.friends.push(from);
    }
    if (!fromRelationship.friends.includes(to)) {
      fromRelationship.friends.push(to);
    }

    await toRelationship.save();
    await fromRelationship.save();

    res.json({ ok: true });
  } catch (error) {
    console.error("Accept request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Deny a friend request
app.post("/api/relationships/deny", async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({ error: "from and to usernames required" });
    }

    let relationship = await Relationship.findOne({ username: to });
    if (relationship) {
      relationship.pending = relationship.pending.filter(u => u !== from);
      await relationship.save();
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Deny request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============ DIRECT MESSAGES ROUTES ============

// Send a message
app.post("/api/messages", async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;

    if (!sender || !receiver || !content) {
      return res.status(400).json({ error: "sender, receiver, and content required" });
    }

    if (sender === receiver) {
      return res.status(400).json({ error: "cannot message yourself" });
    }

    const message = new Message({
      sender,
      receiver,
      content,
      timestamp: new Date(),
      read: false
    });

    await message.save();
    res.json({ ok: true, message });
  } catch (error) {
    console.error("Send message error:", error.message || error);
    console.error("Stack:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get messages (inbox + sent) for a user with a specific conversation partner
app.get("/api/messages/:username/:otherUsername", async (req, res) => {
  try {
    const { username, otherUsername } = req.params;

    // Get all messages between these two users (both directions)
    const messages = await Message.find({
      $or: [
        { sender: username, receiver: otherUsername },
        { sender: otherUsername, receiver: username }
      ]
    }).sort({ timestamp: 1 });

    // Mark received messages as read
    await Message.updateMany(
      { sender: otherUsername, receiver: username, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error.message || error);
    console.error("Stack:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get list of conversations (unique people user has messaged with)
app.get("/api/conversations/:username", async (req, res) => {
  try {
    const username = req.params.username;

    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [
        { sender: username },
        { receiver: username }
      ]
    }).sort({ timestamp: -1 });

    // Extract unique conversation partners
    const conversationMap = new Map();
    
    for (const msg of messages) {
      const otherUser = msg.sender === username ? msg.receiver : msg.sender;
      
      if (!conversationMap.has(otherUser)) {
        conversationMap.set(otherUser, {
          otherUsername: otherUser,
          lastMessage: msg.content,
          lastMessageTime: msg.timestamp,
          unreadCount: msg.sender !== username && !msg.read ? 1 : 0
        });
      } else {
        const conv = conversationMap.get(otherUser);
        if (msg.sender !== username && !msg.read) {
          conv.unreadCount += 1;
        }
      }
    }

    const conversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

    res.json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error.message || error);
    console.error("Stack:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default app;
