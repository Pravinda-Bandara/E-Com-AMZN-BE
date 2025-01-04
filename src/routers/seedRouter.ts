import express,{Request,Response} from "express";
import asyncHandler from "express-async-handler";
import {sampleProducts,sampleUsers} from "../data.js";
import {ProductModel} from "../models/productModel.js";
import {UserModel} from "../models/userModle.js";


export const seedRouter = express.Router()

seedRouter.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        await ProductModel.deleteMany({})
        const createdProducts = await ProductModel.insertMany(sampleProducts)

        await UserModel.deleteMany({})
        const createdUsers = await UserModel.insertMany(sampleUsers)

        res.json({createdProducts,createdUsers})
    })
)
