const express = require("express");
const Router = express.Router();
const EmployeeController = require("../controllers/EmployeeController");
const verifyToken = require("../middleware/jwt");

Router.route("/").get((req, res) => {
  res.json({
    message: "Welcome to the employee routes",
    routes: {
      "/dashboard": {
        GET: "Get employee dashboard",
        PATCH: "Change completion status",
      },
      "/profile": {
        GET: "Get employee profile",
        PATCH: "Update employee profile",
      },
      "/applications": {
        GET: "Get all applied jobs",
        POST: "Apply for a job",
      },
      "/applications/:id": {
        POST: "Apply for a job",
      },
      "/register": {
        POST: "Register an employee",
      },
      "/login": {
        POST: "Login an employee",
      },
      "/apply/:id": {
        POST: "Apply for a job",
      },
    },
  });
});

Router.route("/dashboard")
  .get(verifyToken, EmployeeController.getEmployeeDashboard)
  .patch(verifyToken, EmployeeController.updateEmployeeDashboard);

Router.route("/register").post(EmployeeController.registerEmployee);

Router.route("/login").post(EmployeeController.loginEmployee);

Router.route("/logout").delete(EmployeeController.logout);

Router.route("/profile")
  .get(verifyToken, EmployeeController.getEmployeeProfile)
  .patch(verifyToken, EmployeeController.updateEmployeeProfile);

Router.route("/applications/").get(
  verifyToken,
  EmployeeController.getEmployeeAppliedJobs
);

Router.route("/apply/:id").post(verifyToken, EmployeeController.applyForJob);

module.exports = Router;
