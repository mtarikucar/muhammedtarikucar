const express = require('express');
const cors = require('cors');

require("dotenv").config();

const PORT = process.env.PORT || 5000

app = express();


var corsOptions ={
    origin: "http://localhost:5173"
}

app.use(cors(corsOptions))

app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.listen(PORT, () => {
  console.log(
    process.env.NODE_ENV && process.env.NODE_ENV === "development"
      ? `Started: http://localhost:${PORT}`
      : "Started: "
  );
});