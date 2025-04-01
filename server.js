const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ Connection Error:", err));

// -----------------------------
// 🔐 User Schema and Model
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// ✅ Signup Route
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ username, password });
    await newUser.save();

    res.json({ token: "sample-token", message: "Signup successful" });
  } catch (err) {
    console.error("❌ Signup Error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// ✅ Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ token: "sample-token", message: "Login successful" });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// -----------------------------
// ✅ Task Schema and Model
const TaskSchema = new mongoose.Schema({
  userId: String,
  title: String,
  category: String,
  completed: Boolean
});

const Task = mongoose.model('Task', TaskSchema);

// ✅ Add a task
app.post('/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    console.error("❌ Error saving task:", err);
    res.status(500).json({ error: "Failed to save task" });
  }
});

// ✅ Get tasks for a specific user
app.get('/tasks/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.params.userId });
    res.json(tasks);
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// ✅ Update task by ID
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  // ✅ Normalize category casing to lowercase (optional but recommended)
  const updatedData = {
    ...req.body,
    category: req.body.category?.toLowerCase()
  };

  try {
    const result = await Task.findByIdAndUpdate(id, updatedData, { new: true });
    if (!result) return res.status(404).send("Task not found");

    console.log("✅ Task updated:", result);
    res.json(result);
  } catch (err) {
    console.error("❌ Failed to update task:", err);
    res.status(500).send("Error updating task");
  }
});


// ✅ Root route for testing
app.get("/", (req, res) => {
  res.send("🎉 ToDo API is running!");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// ✅ DELETE a task by ID
app.delete('/tasks/:id', async (req, res) => {
  try {
    const result = await Task.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).send("Task not found");
    res.send(result);
  } catch (err) {
    console.error("❌ Error deleting task:", err);
    res.status(500).send("Failed to delete task");
  }
});
