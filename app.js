const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes");
const eventRouter = require("./routes/event.routes");
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/events", eventRouter);

app.get("/", (req, res) => {
  res.send("This is working");
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

module.exports = app;
