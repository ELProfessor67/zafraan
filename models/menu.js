import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['southern_fried_chicken','chicken','wings','kebabs','kebab_box','hoagie']
    },
    size: {
        type: String,
        enum: ['quarter','half','full']
    },
    image: {
        public_id: {type: String, required: true},
        url: {type: String, required: true}
    }
},{timestamps: true});

export const Menu = mongoose.model.Menu || mongoose.model("menu", schema);