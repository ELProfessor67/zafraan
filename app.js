import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.js';
import orderRoutes from './routes/order.js';
import menuRoutes from './routes/menu.js';
import ErrorMiddleware from './middlewares/error.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
import {resolve, dirname, join} from 'path';
import {fileURLToPath} from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

export const app = express();

// configure .env 
dotenv.config({
    path: './config/config.env'
});

//body parser
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

// configure cors 
app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  );


// routes
const prefix = '/api/v1';
app.use(prefix,userRoutes);
app.use(prefix, orderRoutes);
app.use(prefix, menuRoutes)



//handle error
app.use(ErrorMiddleware);


// render frontend 
app.use(express.static(join(__dirname, "./build")));
app.get("*", (req, res) => {
  res.sendFile(resolve(__dirname, "./build/index.html"));
});
