let express = require('express');
const router = express.Router();
router.use(express.json());
const catchAsync = require('../utilities/catchAsync');
const adminController = require('../controllers/admins');
const { isLoggedIn } = require('../middleware');

router.get('/', isLoggedIn, adminController.viewAdmin);
router.post('/createPost', isLoggedIn, catchAsync(adminController.createPost));

module.exports = router;