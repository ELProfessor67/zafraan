import express from "express";
const router = express.Router();
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import {createOrder,updateOrderStatus,currentOrder,myorder,singleOrder,completeOrder} from '../controllers/order.js';

router.route('/create-order').post(isAuthenticated, createOrder);
router.route('/order-update/:orderId').put(isAuthenticated, authorizeAdmin, updateOrderStatus);
router.route('/current-order').get(isAuthenticated, authorizeAdmin, currentOrder);
router.route('/complete-order').get(isAuthenticated, authorizeAdmin, completeOrder);
router.route('/my-order').get(isAuthenticated, myorder);
router.route('/order-status/:orderId').get(isAuthenticated, singleOrder);


export default router;