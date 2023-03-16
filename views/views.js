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
router.get('/tLogin', function(req, res) {
    res.render('pages/tLogin');
});

module.exports = router;