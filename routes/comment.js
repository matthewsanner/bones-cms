let express = require('express');
const router = express.Router();
const commentController = require('../controllers/comments');

router.get('/', commentController.getComments)
router.post('/create', commentController.createComment)
router.put('/edit/:id', commentController.editComment)
router.get('/delete/:id', commentController.deleteComment)

module.exports = router;