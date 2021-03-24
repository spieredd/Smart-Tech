'use strict';

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`)
});