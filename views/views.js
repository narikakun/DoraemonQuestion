const router = require("express").Router();

router.get('/', function(req, res) {
    res.render('pages/index');
});

// ログイン関係
router.get('/tCreate', function(req, res) {
    res.render('pages/login/tCreate');
});
router.get('/login', function(req, res) {
    res.render('pages/login/login');
});
router.get('/tLogin', function(req, res) {
    res.render('pages/login/tLogin');
});

// クラス関係（ログイン後）
router.get('/class/:classId', function(req, res) {
    res.render('pages/class/boardList', { classId: req.params.classId });
});
router.get('/class/:classId/create', function(req, res) {
    res.render('pages/class/boardCreate', { classId: req.params.classId });
});

module.exports = router;