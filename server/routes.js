const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User, Blog } = require("./models/schema");
router.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
});

// User login
router.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, "secretKey");
    res.status(200).json({ token });
    localStorage.setItem("token", token);
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});
const authenticateToken = (req, res, next) => {
  // Get the JWT token from the request headers
  const token = localStorage.getItem("token");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, "secretKey");
    // Set the authenticated user's information in the request object
    req.user = decoded;
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Reset password
router.patch("/api/users/:id/reset", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: "Error resetting password" });
  }
});
router.get("/api/blogs", async (req, res) => {
  try {
    // Get all blogs logic here
    res.status(200).json({ blogs }); // Replace `blogs` with actual data
  } catch (error) {
    res.status(500).json({ error: "Error retrieving blogs" });
  }
});

// Get Blogs with Pagination
router.get("/api/blogs", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    // Get blogs with pagination logic here
    res.status(200).json({ blogs }); // Replace `blogs` with actual data
  } catch (error) {
    res.status(500).json({ error: "Error retrieving blogs" });
  }
});

// Search Blogs by Title
router.get("/api/blogs", async (req, res) => {
  try {
    const { title } = req.query;
    // Search blogs by title logic here
    res.status(200).json({ blogs }); // Replace `blogs` with actual data
  } catch (error) {
    res.status(500).json({ error: "Error searching blogs" });
  }
});

// Filter Blogs by Category
router.get("/api/blogs", async (req, res) => {
  try {
    const { category } = req.query;
    // Filter blogs by category logic here
    res.status(200).json({ blogs }); // Replace `blogs` with actual data
  } catch (error) {
    res.status(500).json({ error: "Error filtering blogs" });
  }
});

// Sort Blogs by Date
router.get("/api/blogs", async (req, res) => {
  try {
    const { sort, order } = req.query;

    let blogs;
    if (sort === "date") {
      blogs = await Blog.find().sort({ date: order === "asc" ? 1 : -1 });
    } else {
      blogs = await Blog.find();
    }

    res.status(200).json({ blogs });
  } catch (error) {
    console.error("Error retrieving blogs:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/api/blogs", authenticateToken, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const blog = new Blog({
      title,
      content,
      category,
      author: req.user._id,
    });
    await blog.save();
    res.status(201).json({ message: "Blog created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error creating blog" });
  }
});

// Update a Blog
router.patch("/api/blogs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    const blog = await Blog.findByIdAndUpdate(
      id,
      {
        title,
        content,
        category,
      },
      { new: true }
    );
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.status(200).json({ message: "Blog updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating blog" });
  }
});

// Delete a Blog
router.delete("/api/blogs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting blog" });
  }
});

// Like a Blog
router.patch("/api/blogs/:id/like", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    if (blog.likes.includes(req.user._id)) {
      return res
        .status(400)
        .json({ error: "You have already liked this blog" });
    }
    blog.likes.push(req.user._id);
    await blog.save();
    res.status(200).json({ message: "Blog liked successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error liking blog" });
  }
});

// Comment on a Blog
router.patch("/api/blogs/:id/comment", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    blog.comments.push({
      text: comment,
      author: req.user._id,
    });
    await blog.save();
    res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding comment" });
  }
});

// Export the router to be used in the main router.js file
module.exports = router;
