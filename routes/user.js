import express from "express";
const router = express.Router();
import {login,register, loadUser, forgotPassword, resetPassword, logout} from '../controllers/user.js';
import {isAuthenticated} from '../middlewares/auth.js';

router.route('/login').post(login);
router.route('/register').post(register);
router.route('/loadme').get(isAuthenticated, loadUser);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').put(resetPassword);
router.route('/logout').get(isAuthenticated,logout);



export default router;