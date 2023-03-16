const router = require("express").Router();

router.get('/', function(req, res) {
    res.render('pages/index');
});
router.get('/tCreate', function(req, res) {
    res.render('pages/tCreate');
});
router.get('/login', function(req, res) {
    res.render('pages/login');
});

module.exports = router;