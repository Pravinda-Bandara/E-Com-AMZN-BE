import express,{Request,Response} from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import * as mongoose from "mongoose";
import {productRouter} from "./routers/productRouter.js";
import {seedRouter} from "./routers/seedRouter.js";
import {userRouter} from "./routers/userRouter.js";
import {orderRouter} from "./routers/orderRouter.js";
import categoryRouter from "./routers/categoryRouter.js";
const app = express();

dotenv.config()

const MONGODB_URI =
    process.env.MONGODB_LOCAL_URI || 'mongodb://localhost/tsmernamazona'
mongoose.set('strictQuery', true)
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('connected to mongodb')
    })
    .catch(() => {
        console.log('error mongodb')
    })

app.use(
    cors({
        credentials:true,
        origin:['http://localhost:5173']
    })
)
app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.use('/api/products', productRouter)
app.use('/api/seed', seedRouter)
app.use('/api/users',userRouter)
app.use('/api/orders',orderRouter)
app.use('/api/categories',categoryRouter)
const PORT = 5050;
app.listen(5050,()=>{
    console.log(`server is listening at ${PORT}`)
});