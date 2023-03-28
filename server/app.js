const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

app = express();

var allowlist = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://18.197.123.238']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

app.use(cors(corsOptionsDelegate));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




//database
mongoose
  .connect(
    process.env.NODE_ENV && process.env.NODE_ENV == "development"
      ? "mongodb://localhost/muhammedtarikucar"
      : process.env.MONGO_URI
  )
  .then(() => console.log("connected to database"))
  .catch((e) => console.log(e));



//Routers
const postRoutes = require("./routers/post")
const authRoutes = require("./routers/auth")

app.use("/api/auth",authRoutes)
app.use("/api/posts",postRoutes)

app.listen(PORT, () => {
  console.log(
    process.env.NODE_ENV && process.env.NODE_ENV === "development"
      ? `Started: http://localhost:${PORT}`
      : `Started: http://18.197.123.238:${PORT}`
  );
});
