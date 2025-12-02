# MongoDB Migration Guide

## Overview
Your SwampStudy project has been successfully migrated from JSON file-based storage to MongoDB. This provides better scalability, performance, and data management.

## What Changed

### New Files Created
1. **`database.js`** - MongoDB connection setup and Mongoose schemas for:
   - User (username, password)
   - Profile (user profiles with classes, study preferences, etc.)
   - Availability (user availability calendar)
   - Relationship (friend requests and friends list)

2. **`migrate.js`** - Migration script to transfer data from JSON files to MongoDB

3. **`.env.example`** - Environment variable template

### Modified Files
1. **`app.js`** - Replaced all file I/O operations with MongoDB queries
   - All routes now use async/await with Mongoose models
   - Error handling added to all endpoints

2. **`server.js`** - Updated to connect to MongoDB before starting server

3. **`package.json`** - Added mongoose dependency

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Set Up MongoDB

#### Option A: Local MongoDB
- Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
- Start MongoDB service
- Connection string: `mongodb://localhost:27017/swampstudy`

#### Option B: MongoDB Atlas (Cloud)
- Create a free account at https://www.mongodb.com/cloud/atlas
- Create a new cluster
- Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/swampstudy`

### 3. Configure Environment
1. Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/swampstudy
   PORT=3000
   ```

### 4. Install dotenv Package
```bash
npm install dotenv
```

### 5. Update server.js to Load Environment Variables
Add this to the top of `server.js`:
```javascript
import dotenv from "dotenv";
dotenv.config();
```

### 6. Migrate Existing Data (Optional)
If you want to migrate your existing JSON data to MongoDB:

```bash
node migrate.js
```

This will:
- Connect to MongoDB
- Clear any existing data in the collections
- Import data from your JSON files (users.json, profiles.json, availability.json, relationships.json)

**Note:** After migration, you can optionally backup and remove the JSON files since they're no longer needed.

### 7. Start the Server
```bash
npm start
```

## Database Schema

### User Collection
```json
{
  "_id": ObjectId,
  "username": "string (unique)",
  "password": "string"
}
```

### Profile Collection
```json
{
  "_id": ObjectId,
  "username": "string (unique)",
  "classes": ["string"],
  "studyPreference": "string",
  "academicYear": "string",
  "studyGoal": "string",
  "studyFrequency": "string"
}
```

### Availability Collection
```json
{
  "_id": ObjectId,
  "username": "string (unique)",
  "dates": {
    "2025-11-11": "available|unavailable",
    ...
  }
}
```

### Relationship Collection
```json
{
  "_id": ObjectId,
  "username": "string (unique)",
  "pending": ["string (usernames)"],
  "friends": ["string (usernames)"]
}
```

## Benefits of MongoDB

✅ **Scalability** - Easier to scale horizontally
✅ **Performance** - Faster queries compared to JSON file I/O
✅ **Data Validation** - Schema validation at database level
✅ **Atomic Operations** - Built-in transaction support
✅ **Indexing** - Better query performance with indexes
✅ **Backup & Recovery** - Enterprise-grade backup options

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running
- Check your connection string in `.env`
- Verify firewall/network settings for MongoDB Atlas

### Migration Issues
- Ensure JSON files exist in the server directory
- Check file formats are valid JSON
- Run migration before starting the server

### Port Already in Use
- Change PORT in `.env`
- Or find and kill process using port 3000: `lsof -ti:3000 | xargs kill -9` (macOS/Linux)

## Next Steps

1. ✅ All API routes are now MongoDB-based
2. ✅ Your client code doesn't need changes - API endpoints remain the same
3. Consider adding MongoDB indexes for frequently queried fields
4. Implement proper authentication with JWT tokens
5. Add data validation and sanitization

## Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas Getting Started](https://docs.atlas.mongodb.com/)
