require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");

var morgan = require("morgan");

// Initialize Express
const app = express();

app.use(morgan(":method :url - :response-time ms"));

// use cors
app.use(cors());
// content-type - application/json
app.use(express.json());
// application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// sync database
const db = require("./models");
db.sequelize.sync({ force: false });

// use passport config
require("./config/passport");

// Handlebars Setup
app.set("views", path.join(__dirname, "/views"));
app.engine(".hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", ".hbs");

// Static Folder Setup
app.use(express.static(path.join(__dirname, "/public")));

// Main Route
app.get("/", (req, res) => {
    res.redirect("/auth/login");
});

// initialize /auth route
app.use("/auth", require("./routes/auth"));

// initialize /dashboard route
app.use("/dashboard", require("./routes/dashboard"));

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`Server started on port:${PORT}`);
});
