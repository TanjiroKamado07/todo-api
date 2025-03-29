const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Connection Error:", err));

// Task Schema
const TaskSchema = new mongoose.Schema({
  userId: String,
  title: String,
  category: String,
  completed: Boolean
});

const Task = mongoose.model('Task', TaskSchema);

// Get tasks for a specific user
app.get("/tasks/:userId", async (req, res) => {
    try {
      const tasks = await Task.find({ userId: req.params.userId });
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });
  

// Add a task
app.post('/tasks', async (req, res) => {
    try {
      const task = new Task(req.body);
      await task.save();
      res.status(201).json(task);
    } catch (error) {
      console.error("❌ Failed to save task:", error.message);
      res.status(500).json({ error: "Failed to save task" });
    }
  });
  

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));


app.get("/", (req, res) => {
    res.send("🎉 ToDo API is running!");
  });
  