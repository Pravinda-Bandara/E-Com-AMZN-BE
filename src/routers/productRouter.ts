import express, { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { Product, ProductModel } from "../models/productModel.js";
import { isAdmin, isAuth } from "../utils.js";
import { upload } from "../cloudinary.js";

export const productRouter = express.Router();

// /api/products
productRouter.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            pageSize = 10,
            category = '',
            brand = '',
            searchQuery = '',
            sort = '',
            minPrice = 0,
            maxPrice = Infinity,
        } = req.query;

        const pageNumber = Number(page);
        const limit = Number(pageSize);
        const skip = limit * (pageNumber - 1);

        const query: any = {};
        if (category) query.category = category;
        if (brand && typeof brand === 'string') {
            query.brand = { $in: brand.split(',') }; // Logical OR for multiple brands
        }
        if (searchQuery) {
            query.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { brand: { $regex: searchQuery, $options: 'i' } },
                { category: { $regex: searchQuery, $options: 'i' } },
            ];
        }
        if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
        if (maxPrice !== Infinity) query.price = { ...query.price, $lte: Number(maxPrice) };

        let sortOrder = {};
        switch (sort) {
            case 'lowest':
                sortOrder = { price: 1 };
                break;
            case 'highest':
                sortOrder = { price: -1 };
                break;
            case 'toprated':
                sortOrder = { rating: -1 };
                break;
            case 'newest':
                sortOrder = { createdAt: -1 };
                break;
            default:
                sortOrder = {};
        }

        const products = await ProductModel.find(query)
            .sort(sortOrder)
            .skip(skip)
            .limit(limit);

        const countProducts = await ProductModel.countDocuments(query);

        res.send({
            products,
            countProducts,
            page: pageNumber,
            pages: Math.ceil(countProducts / limit),
        });
    })
);

productRouter.get(
    '/categories',
    asyncHandler(async (req: Request, res: Response) => {
        const categories = await ProductModel.find().distinct('category');
        res.json(categories);
    })
);

productRouter.get(
    '/brands',
    asyncHandler(async (req: Request, res: Response) => {
        const {
            category = '',
            searchQuery = '',
            minPrice = 0,
            maxPrice = Infinity,
        } = req.query;

        const filterCriteria: any = {};

        if (category && typeof category === 'string') {
            filterCriteria.category = { $regex: new RegExp(category, 'i') };
        }
        if (searchQuery && typeof searchQuery === 'string') {
            filterCriteria.$or = [
                { name: { $regex: new RegExp(searchQuery, 'i') } },
                { category: { $regex: new RegExp(searchQuery, 'i') } },
            ];
        }
        if (minPrice && maxPrice !== Infinity) {
            filterCriteria.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
        }

        const brands = await ProductModel.find(filterCriteria)
            .select('brand')
            .distinct('brand');

        res.json(brands);
    })
);

productRouter.get(
    '/slug/:slug',
    asyncHandler(async (req: Request, res: Response) => {
        const product = await ProductModel.findOne({ slug: req.params.slug });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product Not Found' });
        }
    })
);

productRouter.get(
    '/admin',
    isAuth,
    isAdmin,
    asyncHandler(async (req: Request, res: Response) => {
        const { query } = req;
        const page = Number(query.page || 1);
        const pageSize = Number(query.pageSize) || 8;

        const products = await ProductModel.find()
            .skip(pageSize * (page - 1))
            .limit(pageSize);
        const countProducts = await ProductModel.countDocuments();

        res.send({
            products,
            countProducts,
            page,
            pages: Math.ceil(countProducts / pageSize),
        });
    })
);



productRouter.delete(
    '/:id',
    isAuth,
    isAdmin,
    asyncHandler(async (req: Request, res: Response) => {
        const product = await ProductModel.findById(req.params.id);
        if (product) {
            const deleteProduct = await product.deleteOne();
            res.send({ message: 'Product Deleted', product: deleteProduct });
        } else {
            res.status(404).send({ message: 'Product Not Found' });
        }
    })
);

productRouter.post(
    '/',
    isAuth,
    isAdmin,
    upload.single('image'),
    asyncHandler(async (req: Request, res: Response) => {
        try {
            const { name, slug, brand, category, description, price, realCountInStock, virtualCountInStock } = req.body;

            // Check for uploaded image
            if (!req.file) {
                res.status(400).send({ message: 'Image upload failed or missing' });
                return;
            }

            // Create product
            const product = new ProductModel({
                name,
                slug,
                image: req.file.path, // Cloudinary image URL
                brand,
                category,
                description,
                price,
                realCountInStock,
                virtualCountInStock,
            });

            const createdProduct = await product.save();
            res.status(201).send({ message: 'Product Created', product: createdProduct });
        } catch (error) {
            console.log(error)
            res.status(500).send({ message: 'Error creating product'});
            
        }
    })
);