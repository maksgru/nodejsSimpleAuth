const express = require("express");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const config = require("config");
const crypto = require("crypto");

const generateAuthToken = () => crypto.randomBytes(30).toString("hex");
const authTokens = {};
const port = config.get("port");

const app = express();
const users = [
  {
    email: "test@mail.com",
    password: "123qwe",
  },
];
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use((req, res, next) => {
  const authToken = req.cookies["AuthToken"];
  req.user = authTokens[authToken];
  next()
});

app.engine("hbs", exphbs({ extname: ".hbs" }));
app.set("view engine", "hbs");

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (users.find((user) => user.email === email)) {
    res.render("register", {
      message: "User already exists",
      messageClass: "alert-danger",
    });
    return;
  }
  users.push({ email, password });
  res.render("login", {
    message: "Registration complite. Please login to continue.",
    messageClass: "alert-success",
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(
    (user) => user.email === email && user.password === password
  );
  if (user) {
    const authToken = generateAuthToken();
    authTokens[authToken] = user;
    res.cookie("AuthToken", authToken);
    res.redirect("protected");
  } else {
    res.render("login", {
      message: "Invalid username or password",
      messageClass: "alert-danger",
    });
  }
});

app.get("/protected", (req, res) => {
  if (req.user) {
    res.render("protected");
  } else {
      res.render('login', {
          message: 'Please login to continue.',
          messageClass: 'alert-dander'
      });
  }
});

app.listen(port, () => console.log(`express server listening on ${port}`));
