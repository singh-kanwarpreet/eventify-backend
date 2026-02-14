const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.routes");
const eventRouter = require("./routes/event.routes");
const reviewRouter = require("./routes/organizerReview.routes");
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/events", eventRouter);
app.use("/api/reviews", reviewRouter);
app.get("/", (req, res) => {
  res.send("This is working");
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

module.exports = app;
