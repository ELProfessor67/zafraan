import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import SuccessHandler from "../utils/successHandler.js";
import getDataUri from '../utils/dataUri.js';
import { Menu } from "../models/menu.js";
import cloudinary from 'cloudinary';
import { modelNames } from "mongoose";


export const addMenu = catchAsyncError(async (req, res, next) => {
    const {name, size, price, category} = req.body;
    const file = req.file;

    if(!name || !size || !price || !category || !file)
        return next(new ErrorHandler("Please enter all field", 400));
    
    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await Menu.create({
        name,
        size,
        price,
        category,
        image: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
        }
    });

    next(new SuccessHandler('Food Add Successfully',201));
});

export const updateMenu = catchAsyncError(async (req, res, next) => {
    const {name, size, price, category} = req.body;
    const file = req.file;
    const {menuId} = req.params;

    if(!name || !size || !price || !category)
        return next(new ErrorHandler("Please enter all field", 400));
    
    let menuFood = await Menu.findById(menuId);

    if(!menuFood) return next(ErrorHandler('Invalid Id',404));

    if(file)
    {
        await cloudinary.v2.uploader.destroy(menuFood.image.public_id);
        const fileUri = getDataUri(file);
        const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
        menuFood.image = {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
        }
    }

    menuFood.name = name;
    menuFood.price = price;
    menuFood.category = category;
    menuFood.size = size;
    await menuFood.save();

    next(new SuccessHandler('Update Successfully',200));
});


export const deleteFood = catchAsyncError(async (req,res,next) => {
    const {menuId} = req.params;
    let menuFood = await Menu.findById(menuId);

    if(!menuFood) return next(ErrorHandler('Invalid Id',404));

    await cloudinary.v2.uploader.destroy(menuFood.image.public_id);

    await Menu.findByIdAndDelete(menuId);

    next(new SuccessHandler('Delete Successfully',200));
});

export const getMenu = catchAsyncError(async (req, res, next) => {
    const {category} = req.query;
    const filter = category ? {category} : {}
    const menu = await Menu.find(filter);
    res.status(200).json({menu});
});

export const getSingleMenu = catchAsyncError(async (req, res, next) => {
    const {menuId} = req.params;
    console.log(menuId);
    const singleMenu = await Menu.findById(menuId);
    if(!singleMenu) return next(new ErrorHandler('Invalid Id',404));
    res.status(200).json({singleMenu});
});




