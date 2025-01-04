import express, { Request, Response } from "express";
import { isAuth, isAdmin } from "../utils.js";
import asyncHandler from "express-async-handler";
import { CategoryModel } from "../models/categoryModel.js"; // Adjust the import path as needed

export const categoryRouter = express.Router();

// Helper function to capitalize each word, including those after spaces or hyphens
const capitalizeCategoryName = (name: string): string => {
    return name
        .split(/[\s\-]+/)  // Split by spaces or hyphens
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
        .join(' '); // Join the words back with spaces
};

// GET all categories (Admin only)
categoryRouter.get(
    '/',
    isAuth,
    asyncHandler(async (req: Request, res: Response) => {
        const categories = await CategoryModel.find();
        res.send(categories);
    })
);

// GET a single category by ID
categoryRouter.get(
    '/:id',
    isAuth,
    asyncHandler(async (req: Request, res: Response) => {
        const category = await CategoryModel.findById(req.params.id);
        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category Not Found' });
        }
    })
);

// POST to create a new category (Admin only)
categoryRouter.post(
    '/',
    isAuth,
    isAdmin,
    asyncHandler(async (req: Request, res: Response) => {
        const { name } = req.body;

        if (!name) {
            res.status(400).send({ message: 'Name is required' });
            return;
        }

        // Capitalize category name before saving
        const capitalizedCategoryName = capitalizeCategoryName(name);

        const categoryExists = await CategoryModel.findOne({ name: capitalizedCategoryName });
        if (categoryExists) {
            res.status(400).send({ message: 'Category already exists' });
            return;
        }

        const newCategory = new CategoryModel({ name: capitalizedCategoryName });
        const createdCategory = await newCategory.save();
        res.status(201).send({ message: 'Category created', category: createdCategory });
    })
);

// PATCH to update an existing category (Admin only)
categoryRouter.patch(
    '/:id',
    isAuth,
    isAdmin,
    asyncHandler(async (req: Request, res: Response) => {
        const { name } = req.body;

        if (!name) {
            res.status(400).send({ message: 'Name is required' });
            return;
        }

        // Capitalize category name before saving
        const capitalizedCategoryName = capitalizeCategoryName(name);

        const category = await CategoryModel.findById(req.params.id);
        if (category) {
            category.name = capitalizedCategoryName;
            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404).send({ message: 'Category not found' });
        }
    })
);

// DELETE a category by ID (Admin only)
categoryRouter.delete(
    '/:id',
    isAuth,
    isAdmin,
    asyncHandler(async (req: Request, res: Response) => {
        const category = await CategoryModel.findByIdAndDelete(req.params.id);
        if (category) {
            res.json({ message: 'Category deleted successfully', category });
        } else {
            res.status(404).send({ message: 'Category Not Found' });
        }
    })
);

export default categoryRouter;
