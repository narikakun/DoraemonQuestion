const router = require("express").Router();

router.get('/*', (req, res) => {
    res.redirect('/images/image404.png');
});

module.exports = router;