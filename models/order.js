import mongoose from "mongoose";
import validator from "validator";
import { User } from "./zuser.js";

const schema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    validate: validator.isMobilePhone
  },
  address: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    validate: validator.isEmail,
  },
  status: {
    type: String,
    required: true,
    enum: ['order_placed','order_confirmation','preparation','out_for_delivery','complete'],
    default: 'order_placed'
  },
  order: [
    {
        menuId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'menu'
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        size: {
            type: String,
            enum: ['quarter','half','full']
        },
        quantity: {
            type: Number,
            required: true
        }
    }
  ]
},{timestamps: true});

export const Order = mongoose.model.Order || mongoose.model("order", schema);