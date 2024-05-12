const express = require("express");
const Router = express.Router();

Router.route("/").get((req, res) => {
  res.json({
    message: "Welcome to the API",
  });
});

module.exports = Router;