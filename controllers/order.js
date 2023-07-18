import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import SuccessHandler from "../utils/successHandler.js";
import { Order } from "../models/order.js";
import {sendEmail} from '../utils/sendEmail.js';


// user 
export const createOrder = catchAsyncError(async (req, res, next) => {
  const {phone, address, order} = req.body;
  if(!phone || !address || !order) 
    return next(new ErrorHandler("Please enter all field", 400));

  const newOrder = await Order.create({
    phone,
    address,
    order,
    email: req.user.email,
    user: req.user._id
  });

  const EventsEmitter = req.app.get('EventsEmitter');
  EventsEmitter.emit('new-order',{order: newOrder});
  next(new SuccessHandler('Order Placed Successfully', 201));
  
  let items = "";
  order.forEach(element => {
    items += ` ${element.name} - ${element.quantity} |`
  });

  const message = `name: ${req.user.name}, OrderId: ${newOrder._id}, address: ${address}, phone: ${phone}, order: ${items}`
  console.log(req.user.name, newOrder._id, phone, address, items);
  await sendEmail(process.env.ADMIN_MAIL, "zafraan.eu new order placed", message);
  await sendEmail(newOrder.email, "zafraan.eu order placed", "your order has been successfully placed");
});

// admin 
export const updateOrderStatus = catchAsyncError(async (req, res, next) => {
  const {orderId} = req.params;
  const {status} = req.body;

  if(!status) return next(new ErrorHandler('Please Give Status',402));

  const order = await Order.findById(orderId).populate('user');

  if(!order) return next(new ErrorHandler('Invalid Order Id', 402));

  order.status = status;
  await order.save();

  const EventsEmitter = req.app.get('EventsEmitter');
  EventsEmitter.emit('update-order',{order});
  next(new SuccessHandler('Update Status Successfully', 200));
  let message = "";
  switch (status) {
    case "order_placed":
      message = `${order?.user?.name} your order has been successfully placed`;
      break;

    case "order_confirmation":
      message = `${order?.user?.name} your order has been confirmed`;
      break;

    case "preparation":
      message = `${order?.user?.name} your order has been prepared`;
      break;

    case "out_for_delivery":
      message = `${order?.user?.name} your order has been out for delivery`;
      break;

    case "complete":
      message = `${order?.user?.name} your order has been successfully completed`;
      break;
  
    default:
      message = `${order?.user?.name} your order has been successfully placed`;
      break;
  }
  await sendEmail(process.env.ADMIN_MAIL, "zafraan.eu your order status", message);
});


// admin
export const currentOrder = catchAsyncError(async (req, res, next) => {
  const currentOrders = await Order.find({status: {$ne: 'complete'}}).sort({createdAt: -1});
  res.status(200).json({
    orders: currentOrders
  });
});

// admin
export const completeOrder = catchAsyncError(async (req, res, next) => {
  const currentOrders = await Order.find({status: {$eq: 'complete'}}).sort({createdAt: -1}).populate('user');
  res.status(200).json({
    orders: currentOrders
  });
});



// user 
export const myorder = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find({email: req.user.email});
  res.status(200).json({
    myorder: orders
  });
});

//single order user
export const singleOrder = catchAsyncError(async (req, res, next) => {
  const {orderId} = req.params;
  const order = await Order.findById(orderId);

  if(!order) return next(new ErrorHandler('Invalid Order Id', 402));
  if(order.email !== req.user.email) return res.redirect(process.env.FRONTEND_URL);

  res.status(200).json({
    signleOrder: order
  });
});