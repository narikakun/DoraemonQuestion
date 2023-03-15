const router = require("express").Router();

router.get('/', function(req, res) {
    res.render('pages/index');
});
router.get('/tCreate', function(req, res) {
    res.render('pages/tCreate');
});

module.exports = router;