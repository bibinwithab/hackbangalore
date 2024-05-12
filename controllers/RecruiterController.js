require("dotenv").config();

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Job = require("../models/Job");
const Employee = require("../models/Employee");
const Recruiter = require("../models/Recruiter");

// @ GET dashboard
// @ desc Get recruiter dashboard
// @ route api/recruiter/dashboard/
// WORKS
const getRecruiterDashboard = asyncHandler(async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.user.id);

    const recruiterWithoutPassword = recruiter.toObject();
    delete recruiterWithoutPassword.password;
    res.json(recruiterWithoutPassword);
    res.json(recruiter);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: `${error}` });
  }
});

// @ PATCH dashboard
// @ desc Change completion status
// @ route api/recruiter/dashboard/
// WORKS
const updateRecruiterDashboard = asyncHandler(async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.user.id);
    const job = await Job.findOne({ recruiter: recruiter._id });
    if (!job) {
      return res.status(404).json({ message: "Job not found for this recruiter" });
    }
    job.completed = !job.completed;
    await job.save();
    res.json(job);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: `${error}` });
  }
});

// @ GET jobListing
// @ desc Get all jobs posted
// @ route api/recruiter/jobListing/
// WORKS
const getJobListing = asyncHandler(async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const jobs = await Job.find({ recruiter: recruiterId });
    res.json(jobs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: `${error}` });
  }
});

// @ POST jobListing
// @ desc Post a job
// @ route api/recruiter/jobListing/
// WORKS
const postJob = asyncHandler(async (req, res) => {
  try {
    const id = req.user.id;
    const { title, description, completed } = req.body;
    const job = await Job.create({
      title,
      description,
      recruiter: id,
      completed,
    });
    res.json(job);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: `${error}` });
  }
});

// @ DELETE jobListing
// @ desc Delete a job
// @ route api/recruiter/jobListing/
// WORKS
const deleteJob = asyncHandler(async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: `${error}` });
  }
});

// @ POST register
// @ desc Register a recruiter
// @ route api/recruiter/register/
// WORKS
const registerRecruiter = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, bio } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingRecruiter = await Recruiter.findOne({ email: email });

    if (existingRecruiter) {
      return res
        .status(400)
        .json({ message: "Recruiter with this email already exists" });
    }

    const recruiter = await Recruiter.create({
      name,
      email,
      password: hashedPassword,
      bio,
    });
    const recruiterWithoutPassword = recruiter.toObject();
    delete recruiterWithoutPassword.password;
    res.json(recruiterWithoutPassword);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: `${error}` });
  }
});

// @ POST login
// @ desc Login a recruiter
// @ route api/recruiter/login/
// WORKS
const loginRecruiter = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const recruiter = await Recruiter.findOne({ email: email });
    if (!recruiter) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, recruiter.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: recruiter._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .json({
        token,
        recruiter: {
          _id: recruiter._id,
          name: recruiter.name,
          email: recruiter.email,
          bio: recruiter.bio,
        },
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: `${error}` });
  }
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", { sameSite: "none", secure: true });
  res.json({ message: "Logged out successfully" });
});

module.exports = {
  getRecruiterDashboard,
  updateRecruiterDashboard,
  getJobListing,
  postJob,
  deleteJob,
  registerRecruiter,
  loginRecruiter,
  logout,
};
