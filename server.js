import { config } from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./config/database.js";
import cloudinary from 'cloudinary';
import {Server} from 'socket.io';
import Events from 'events';
connectDB();


// configure cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_API,
    api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

const EventsEmitter = new Events();
app.set('EventsEmitter',EventsEmitter);
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`server listing on port ${PORT}`);
});


// socket io 
const io = new Server(server,{
	cors: {
		origin: process.env.FRONTEND_URL,
		methods: ['GET','POST']
	}
});

io.on('connection', (socket) => {
    socket.on('join-user',({roomId}) => {
        socket.join(roomId);
    });
    socket.on('join-admin',({}) => {
        socket.join('zafrannowneradmin');
    });
});

EventsEmitter.on('update-order',({order}) => {
    io.to(order._id.toString()).emit('update-order',{order});
});

EventsEmitter.on('new-order',(order) => {
    io.to('zafrannowneradmin').emit('new-order',{order});
});