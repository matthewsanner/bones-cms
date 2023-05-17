let express = require('express');
const router = express.Router();
router.use(express.json());
const adminController = require('../controllers/admins');

router.get('/', adminController.viewAdmin)
router.post('/createPost', adminController.createPost)

module.exports = router;