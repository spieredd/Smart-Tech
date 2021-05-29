const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/app/home');
});

router.get('/home', (req, res) => {
    res.render('pages/home');
});

module.exports = router;