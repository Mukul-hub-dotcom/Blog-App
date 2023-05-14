const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const connection = require("./db");
const app = express();
connection();
app.use(cors());
app.use(express.json());

app.use(routes);
app.listen(3000, () => {
  console.log("Backend started");
});
