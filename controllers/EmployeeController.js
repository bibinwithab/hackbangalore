require("dotenv").config();

const Job = require("../models/Job");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const Recruiter = require("../models/Recruiter");
const asyncHandler = require("express-async-handler");

// @ GET dashboard
// @ desc Get employee dashboard
// @ route api/employee/dashboard/
// WORKS
const getEmployeeDashboard = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.user.id).populate("appliedJobs");
  res.json(employee);
});

// @ PATCH dashboard
// @ desc Change completion status
// @ route api/employee/dashboard/
// WORKS
const updateEmployeeDashboard = asyncHandler(async (req, res) => {
  // const job = await Job.findById(req.body.jobId);
  const employee = await Employee.findById(req.user.id).populate("appliedJobs");
  employee.appliedJobs.forEach(async (job) => {
    job.completed = !job.completed;
    await job.save();
  });
  res.json({ message: "Updated" });
});

// @ GET profile
// @ desc Get employee profile
// @ route api/employee/profile/
// WORKS
const getEmployeeProfile = asyncHandler(async (req, res) => {
  const employeeId = req.user.id;

  try {
    const employee = await Employee.findById(employeeId);
    res.json(employee);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// @ PATCH profile
// @ desc Update employee profile
// @ route api/employee/profile/
// Works
const updateEmployeeProfile = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.user.id);
  employee.name = req.body.name || employee.name;
  employee.email = req.body.email || employee.email;
  employee.contact = req.body.contact || employee.contact;
  employee.skills = req.body.skills || employee.skills;
  employee.Education = req.body.Education || employee.Education;
  employee.rating = req.body.rating || employee.rating;
  await employee.save();
  res.json(employee);
});

// @ GET applications
// @ desc Get all applied jobs
// @ route api/employee/applications/
// WORKS
const getEmployeeAppliedJobs = asyncHandler(async (req, res) => {
  const employeeId = req.user.id;
  const employee = await Employee.findById(employeeId);
  if (employee.appliedJobs.length === 0) {
    res.json({ message: "You have not applied for any job yet" });
  } else {
    const jobNames = await Job.find({
      _id: { $in: employee.appliedJobs },
    }).select("title");
    const appliedJobNames = jobNames.map((job) => job.title);
    res.json(appliedJobNames);
  }
});

// @ POST applications
// @ desc Apply for a job
// @ route api/employee/apply/:id/
// WORKS
const applyForJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  const employeeId = req.user.id;

  if (job.applicants.includes(employeeId)) {
    return res
      .status(400)
      .json({ message: "Employee has already applied for this job" });
  }

  job.applicants.push(employeeId);

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }
  employee.appliedJobs.push(job.id);
  await employee.save();

  await job.save();
  res.json(`Application for ${job.title} has been submitted`);
});

// @ POST register
// @ desc Register a new employee
// @ route api/employee/register/
// WORKS
const registerEmployee = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, bio, contact, skills, education, rating } =
      req.body;

    const existingEmployee = await Employee.findOne({ email: email });
    if (existingEmployee) {
      return res
        .status(400)
        .json({ message: "Employee with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await Employee.create({
      name,
      email,
      password: hashedPassword,
      bio,
      contact,
      skills,
      education,
    });
    const employeeWithoutPassword = employee.toObject();
    delete employeeWithoutPassword.password;
    res.json(employeeWithoutPassword);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: `${error}` });
  }
});

// @ POST login
// @ desc Login an employee
// @ route api/employee/login/
// WORKS
const loginEmployee = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordMatch = await bcrypt.compare(password, employee.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: employee._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .json({
        token,
        employee: {
          _id: employee._id,
          name: employee.name,
          email: employee.email,
          bio: employee.bio,
          contact: employee.contact,
          skills: employee.skills,
          education: employee.education,
          rating: employee.rating,
        },
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", { sameSite: "none", secure: true });
  res.json({ message: "Logged out successfully" });
});

module.exports = {
  getEmployeeDashboard,
  applyForJob,
  getEmployeeProfile,
  updateEmployeeProfile,
  getEmployeeAppliedJobs,
  updateEmployeeDashboard,
  registerEmployee,
  loginEmployee,
  logout,
};
