const express = require("express");
const Router = express.Router();
const RecruiterController = require("../controllers/RecruiterController");
const verifyToken = require("../middleware/jwt");

Router.route("/").get((req, res) => {
  res.json({
    message: "Welcome to the recruiter routes",
    routes: {
      "/dashboard": {
        GET: "Get recruiter dashboard",
        PATCH: "Change completion status",
      },
      "/jobListing": {
        GET: "Get all jobs posted",
        POST: "Post a job",
        DELETE: "Delete a job",
      },
      "/register": {
        POST: "Register a recruiter",
      },
      "/jobListing/:id": {
        DELETE: "Delete a job",
      },
    },
  });
});

Router.route("/dashboard")
  .get(verifyToken, RecruiterController.getRecruiterDashboard)
  .patch( verifyToken, RecruiterController.updateRecruiterDashboard);

Router.route("/register").post(RecruiterController.registerRecruiter);

Router.route("/login").post(RecruiterController.loginRecruiter);

Router.route("/logout").delete(RecruiterController.logout);

Router.route("/jobListing")
  .get(verifyToken, RecruiterController.getJobListing)
  .post(verifyToken, RecruiterController.postJob);

Router.route("/jobListing/:id").delete(verifyToken, RecruiterController.deleteJob);


module.exports = Router;
