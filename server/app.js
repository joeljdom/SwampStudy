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
    const isAdmin = req.body?.isAdmin === true; // Admin flag from request

    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });

    const existingUser = await User.findOne({ username: { $regex: `^${username}$`, $options: "i" } });
    if (existingUser) {
      return res.status(409).json({ error: "username already exists" });
    }

    const hashedPassword = hashPassword(password);
    const user = new User({ username, password: hashedPassword, role: isAdmin ? "admin" : "user" });
    await user.save();
    res.json({ ok: true, username, role: user.role });
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

    // Find user by username first (to handle existing records that may store plaintext)
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const hashedPassword = hashPassword(password);

    // If stored password matches hashed password, good. If stored password is plaintext (legacy),
    // allow login and migrate to hashed password on first successful login.
    if (user.password === hashedPassword) {
      return res.json({ ok: true, username, role: user.role || "user" });
    }

    if (user.password === password) {
      // Legacy plaintext password detected — re-hash and save for security
      try {
        user.password = hashedPassword;
        await user.save();
      } catch (e) {
        console.error('Failed to migrate plaintext password for user', username, e);
      }
      return res.json({ ok: true, username, role: user.role || "user" });
    }

    return res.status(401).json({ error: "invalid credentials" });
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

    const savedMessage = await message.save();
    res.json({ ok: true, message: savedMessage.toJSON ? savedMessage.toJSON() : savedMessage });
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
    }).sort({ timestamp: 1 }).lean();

    // Mark received messages as read
    await Message.updateMany(
      { sender: otherUsername, receiver: username, read: false },
      { read: true }
    );

    res.json(messages || []);
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
    }).sort({ timestamp: -1 }).lean();

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

    res.json(conversations || []);
  } catch (error) {
    console.error("Get conversations error:", error.message || error);
    console.error("Stack:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============ ADMIN ROUTES ============

// Get all users with their profiles for admin dashboard
app.get("/api/admin/users/:adminUsername", async (req, res) => {
  try {
    const { adminUsername } = req.params;
    
    // Verify user is admin
    const admin = await User.findOne({ username: adminUsername });
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized: admin access required" });
    }

    // Get all users except the admin
    const users = await User.find({ username: { $ne: adminUsername } }).select("username role").lean();
    
    // Fetch profiles for each user
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        const profile = await Profile.findOne({ username: user.username }).lean();
        return { ...user, profile };
      })
    );

    res.json(usersWithProfiles);
  } catch (error) {
    console.error("Get admin users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Search users by username or class for admin
app.get("/api/admin/search/:adminUsername", async (req, res) => {
  try {
    const { adminUsername } = req.params;
    const query = (req.query.q || "").trim();

    if (!query) {
      return res.status(400).json({ error: "search query required" });
    }

    // Verify user is admin
    const admin = await User.findOne({ username: adminUsername });
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized: admin access required" });
    }

    // Search by username or in profile classes
    const users = await User.find({
      username: { $regex: query, $options: "i", $ne: adminUsername }
    }).select("username role").lean();

    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        const profile = await Profile.findOne({ username: user.username }).lean();
        return { ...user, profile };
      })
    );

    // Also search by class name in profiles
    const profilesByClass = await Profile.find({
      classes: { $regex: query, $options: "i" }
    }).lean();

    const classSearchUsers = await Promise.all(
      profilesByClass.map(async (profile) => {
        const user = await User.findOne({ username: profile.username }).select("username role").lean();
        return user ? { ...user, profile } : null;
      })
    ).then(u => u.filter(Boolean));

    // Merge and deduplicate
    const merged = new Map();
    [...usersWithProfiles, ...classSearchUsers].forEach(u => {
      merged.set(u.username, u);
    });

    res.json(Array.from(merged.values()));
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user details with friends and calendar for admin
app.get("/api/admin/user/:adminUsername/:targetUsername", async (req, res) => {
  try {
    const { adminUsername, targetUsername } = req.params;

    // Verify user is admin
    const admin = await User.findOne({ username: adminUsername });
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized: admin access required" });
    }

    // Get user profile
    const profile = await Profile.findOne({ username: targetUsername }).lean();
    
    // Get user's friends
    const relationship = await Relationship.findOne({ username: targetUsername }).lean();
    const friends = relationship?.friends || [];

    // Get user's availability/calendar
    const availability = await Availability.findOne({ username: targetUsername }).lean();
    const calendar = availability?.dates ? Object.fromEntries(availability.dates) : {};

    res.json({
      username: targetUsername,
      profile,
      friends,
      calendar
    });
  } catch (error) {
    console.error("Get admin user details error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Edit user profile (admin only)
app.post("/api/admin/user/:adminUsername/:targetUsername", async (req, res) => {
  try {
    const { adminUsername, targetUsername } = req.params;
    const { classes, studyPreference, academicYear, studyGoal, studyFrequency } = req.body;

    // Verify user is admin
    const admin = await User.findOne({ username: adminUsername });
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized: admin access required" });
    }

    if (!classes || !Array.isArray(classes) || !studyPreference) {
      return res.status(400).json({ error: "classes (array) and studyPreference required" });
    }

    let profile = await Profile.findOne({ username: targetUsername });
    if (!profile) {
      profile = new Profile({
        username: targetUsername,
        classes,
        studyPreference,
        academicYear: academicYear || "unknown",
        studyGoal: studyGoal || [],
        studyFrequency: studyFrequency || "unknown"
      });
    } else {
      profile.classes = classes;
      profile.studyPreference = studyPreference;
      profile.academicYear = academicYear || profile.academicYear;
      profile.studyGoal = studyGoal || profile.studyGoal;
      profile.studyFrequency = studyFrequency || profile.studyFrequency;
    }

    await profile.save();
    res.json({ ok: true, profile });
  } catch (error) {
    console.error("Edit profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default app;
