require("dotenv").config();
require("./jobs/eventStatus.job");
require("./app");
const dbConnection = require("./db/db");

dbConnection();
