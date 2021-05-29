require('dotenv').config();

const express = require('express');
const chalk = require('chalk');
const router = require('./router');
const { use } = require('./router');

const app = express();

app.use('/app', router);
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded());

app.get('/', (req, res) => {
    res.redirect('/app');
});

const PORT = process.env.PORT;

app.listen(PORT, (err) => {
    if (err) console.log(chalk.red(`ERROR: ${err}`));
    console.log(chalk.blue(`PORT: ${PORT}`));
});