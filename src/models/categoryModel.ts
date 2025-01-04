import { modelOptions, prop, getModelForClass } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { timestamps: true } })
export class Category {
    public _id?: string;

    @prop({ required: true, unique: true })
    public name!: string;
}

export const CategoryModel = getModelForClass(Category);
