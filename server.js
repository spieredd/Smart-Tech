require('dotenv').config();

const express = require("express");
const chalk = require('chalk');
const expressip = require('express-ip');

const app = express();

app.set("trust proxy", true);
app.use((req, res, next) => {
  if (!req.secure) return res.redirect("https://" + req.get("host") + req.url);
  next();
});

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(expressip().getIpInfoMiddleware);

app.get("/", (req, res) => {
    console.log(req.ipInfo);
  res.sendFile(`${__dirname}/index.html`);
});

app.listen(PORT, () => {
  console.log(chalk.bgYellow(`Server listening on port ${PORT}...`));
});
