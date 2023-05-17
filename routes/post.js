let express = require('express');
const router = express.Router();
router.use(express.json());
const postController = require('../controllers/posts');

router.get('/', postController.getPosts)
router.get('/:id', postController.findPost)
router.get('/delete/:id', postController.deletePost)
router.get('/edit/:id', postController.viewEditPost)
router.put('/:id', postController.editPost)
router.get('/hashtags/:hashtag', postController.getHashtag)

module.exports = router;