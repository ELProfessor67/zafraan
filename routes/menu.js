import express from "express";
const router = express.Router();
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import {addMenu, updateMenu, getMenu, deleteFood,getSingleMenu} from '../controllers/menu.js';
import singleUpload from '../middlewares/multer.js';

router.route('/add-menu').post(isAuthenticated, authorizeAdmin,singleUpload,addMenu);
router.route('/get-menu').get(getMenu);
router.route('/update-menu/:menuId').put(isAuthenticated,authorizeAdmin,singleUpload,updateMenu);
router.route('/delete-menu/:menuId').delete(isAuthenticated,authorizeAdmin, deleteFood);
router.route('/single-menu/:menuId').get(isAuthenticated,authorizeAdmin,getSingleMenu);

export default router;