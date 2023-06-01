const router = require("express").Router();

router.get('/', function (req, res) {
    res.render('pages/index');
});

// ログイン関係
router.get('/tCreate', function (req, res) {
    res.render('pages/login/tCreate');
});
router.get('/login', function (req, res) {
    res.render('pages/login/login');
});
router.get('/tLogin', function (req, res) {
    res.render('pages/login/tLogin');
});

// クラス関係（ログイン後）
router.get('/class/:classId', function (req, res) {
    res.render('pages/class/boardList', {classId: req.params.classId, username: req.cookies.username});
});
router.get('/class/:classId/create', function (req, res) {
    res.render('pages/class/boardCreate', {classId: req.params.classId, username: req.cookies.username});
});
router.get('/class/:classId/board/:boardId', function (req, res) {
    res.render('pages/class/boardShow', {
        classId: req.params.classId,
        boardId: req.params.boardId,
        username: req.cookies.username
    });
});

// 管理者向け
router.get('/admin/:classId', function (req, res) {
    res.render('pages/admin/mainAdmin', {classId: req.params.classId, username: req.cookies.username});
});
router.get('/admin/:classId/boards', function (req, res) {
    res.render('pages/admin/boardAdmin', {classId: req.params.classId, username: req.cookies.username});
});
router.get('/admin/:classId/lesson', function (req, res) {
    res.render('pages/admin/lessonAdmin', {classId: req.params.classId, username: req.cookies.username});
});
router.get('/admin/:classId/createLesson', function (req, res) {
    res.render('pages/admin/createLessonAdmin', {classId: req.params.classId, username: req.cookies.username});
});
router.get('/admin/:classId/comment/:boardId', function (req, res) {
    res.render('pages/admin/commentAdmin', {
        classId: req.params.classId,
        boardId: req.params.boardId,
        username: req.cookies.username
    });
});

module.exports = router;