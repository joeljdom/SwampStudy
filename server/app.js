// app.js
import express from "express";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Simple request logger to help debugging incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// database file
const USERS_PATH = "./users.json";
if (!fs.existsSync(USERS_PATH)) fs.writeFileSync(USERS_PATH, "[]");

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_PATH, "utf-8"));
}

function writeUsers(arr) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(arr, null, 2));
}

// signup route
app.post("/api/signup", (req, res) => {
  const username = (req.body?.username || "").trim();
  const password = (req.body?.password || "").trim();

  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });

  const users = readUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: "username already exists" });
  }

  users.push({ username, password });
  writeUsers(users);
  res.json({ ok: true, username });
});

// login route
app.post("/api/login", (req, res) => {
  const username = (req.body?.username || "").trim();
  const password = (req.body?.password || "").trim();

  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });

  const users = readUsers();
  const match = users.find(u => u.username === username && u.password === password);
  if (!match) return res.status(401).json({ error: "invalid credentials" });

  res.json({ ok: true, username });
});

// Availability data file
const AVAILABILITY_PATH = "./availability.json";
if (!fs.existsSync(AVAILABILITY_PATH)) fs.writeFileSync(AVAILABILITY_PATH, "{}");

function readAvailability() {
  return JSON.parse(fs.readFileSync(AVAILABILITY_PATH, "utf-8"));
}

function writeAvailability(data) {
  fs.writeFileSync(AVAILABILITY_PATH, JSON.stringify(data, null, 2));
}

// Get user's availability
app.get("/api/availability/:username", (req, res) => {
  const username = req.params.username;
  const allAvailability = readAvailability();
  const userAvailability = allAvailability[username] || {};
  res.json(userAvailability);
});

// Save user's availability for a date
app.post("/api/availability/:username", (req, res) => {
  const username = req.params.username;
  const { date, status } = req.body;

  if (!date || !status) {
    return res.status(400).json({ error: "date and status required" });
  }

  if (status !== "available" && status !== "unavailable") {
    return res.status(400).json({ error: "status must be 'available' or 'unavailable'" });
  }

  const allAvailability = readAvailability();
  if (!allAvailability[username]) {
    allAvailability[username] = {};
  }
  
  allAvailability[username][date] = status;
  writeAvailability(allAvailability);
  
  res.json({ ok: true, availability: allAvailability[username] });
});

export default app;
export { USERS_PATH, AVAILABILITY_PATH };

// Profiles data file
const PROFILES_PATH = "./profiles.json";
if (!fs.existsSync(PROFILES_PATH)) fs.writeFileSync(PROFILES_PATH, "{}");

function readProfiles() {
  return JSON.parse(fs.readFileSync(PROFILES_PATH, "utf-8"));
}

function writeProfiles(data) {
  fs.writeFileSync(PROFILES_PATH, JSON.stringify(data, null, 2));
}

// Get user's profile
app.get("/api/profile/:username", (req, res) => {
  const username = req.params.username;
  const profiles = readProfiles();
  res.json(profiles[username] || null);
});

// Save/update user's profile
app.post("/api/profile/:username", (req, res) => {
  const username = req.params.username;
  let { classes, studyPreference, academicYear, studyGoal, studyFrequency } = req.body;
  console.log('Received profile POST:', req.body); // Debug: print incoming payload
  if (!username || !classes || !Array.isArray(classes) || !studyPreference) {
    return res.status(400).json({ error: "username, classes (array), and studyPreference required" });
  }
  if (!academicYear) academicYear = "unknown";
  if (!studyGoal) studyGoal = "unknown";
  if (!studyFrequency) studyFrequency = "unknown";
  const profiles = readProfiles();
  profiles[username] = { classes, studyPreference, academicYear, studyGoal, studyFrequency };
  console.log('Writing profile:', profiles[username]); // Debug: print what will be written
  writeProfiles(profiles);
  res.json({ ok: true, profile: profiles[username] });
});

// Get all profiles for matching
app.get("/api/profiles", (req, res) => {
  const profiles = readProfiles();
  res.json(profiles);
});

export { PROFILES_PATH };

// Relationships data file
const RELATIONSHIPS_PATH = "./relationships.json";
if (!fs.existsSync(RELATIONSHIPS_PATH)) fs.writeFileSync(RELATIONSHIPS_PATH, "{}");

function readRelationships() {
  return JSON.parse(fs.readFileSync(RELATIONSHIPS_PATH, "utf-8"));
}

function writeRelationships(data) {
  fs.writeFileSync(RELATIONSHIPS_PATH, JSON.stringify(data, null, 2));
}

// Get pending requests for a user
app.get("/api/relationships/pending/:username", (req, res) => {
  const username = req.params.username;
  const relationships = readRelationships();
  const userRelationships = relationships[username] || { pending: [], friends: [] };
  res.json({ pending: userRelationships.pending || [] });
});

// Get friends for a user
app.get("/api/relationships/friends/:username", (req, res) => {
  const username = req.params.username;
  const relationships = readRelationships();
  const userRelationships = relationships[username] || { pending: [], friends: [] };
  res.json({ friends: userRelationships.friends || [] });
});

// Send a friend request (add to pending)
app.post("/api/relationships/request", (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) {
    return res.status(400).json({ error: "from and to usernames required" });
  }
  if (from === to) {
    return res.status(400).json({ error: "cannot add yourself" });
  }

  const relationships = readRelationships();
  
  // Initialize if needed
  if (!relationships[to]) relationships[to] = { pending: [], friends: [] };
  
  // Check if already pending or friends
  if (relationships[to].pending && relationships[to].pending.includes(from)) {
    return res.status(400).json({ error: "request already pending" });
  }
  if (relationships[to].friends && relationships[to].friends.includes(from)) {
    return res.status(400).json({ error: "already friends" });
  }
  
  // Add to pending
  if (!relationships[to].pending) relationships[to].pending = [];
  relationships[to].pending.push(from);
  
  writeRelationships(relationships);
  res.json({ ok: true });
});

// Accept a friend request
app.post("/api/relationships/accept", (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) {
    return res.status(400).json({ error: "from and to usernames required" });
  }

  const relationships = readRelationships();
  
  // Initialize if needed
  if (!relationships[to]) relationships[to] = { pending: [], friends: [] };
  if (!relationships[from]) relationships[from] = { pending: [], friends: [] };
  
  // Remove from pending
  if (relationships[to].pending) {
    relationships[to].pending = relationships[to].pending.filter(u => u !== from);
  }
  
  // Add to friends (both directions)
  if (!relationships[to].friends) relationships[to].friends = [];
  if (!relationships[from].friends) relationships[from].friends = [];
  
  if (!relationships[to].friends.includes(from)) {
    relationships[to].friends.push(from);
  }
  if (!relationships[from].friends.includes(to)) {
    relationships[from].friends.push(to);
  }
  
  writeRelationships(relationships);
  res.json({ ok: true });
});

// Deny a friend request
app.post("/api/relationships/deny", (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) {
    return res.status(400).json({ error: "from and to usernames required" });
  }

  const relationships = readRelationships();
  
  if (relationships[to] && relationships[to].pending) {
    relationships[to].pending = relationships[to].pending.filter(u => u !== from);
  }
  
  writeRelationships(relationships);
  res.json({ ok: true });
});

export { RELATIONSHIPS_PATH };
