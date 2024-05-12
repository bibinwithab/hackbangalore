require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
const logger = require("./middleware/logger");

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(cookieParser());
app.use('/api', require('./routes/root'));
app.use('/api/recruiter', require('./routes/recruiterRoutes'))
app.use('/api/employee', require('./routes/employeeRoutes'))

app.listen(PORT, () => {
  console.log(`Server heard on http://localhost:${PORT}`);
  mongoose.connect(process.env.DB_URI).then(() => {
    console.log("Connected to DB");
  });
});
