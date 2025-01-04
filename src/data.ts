import bcrypt from 'bcryptjs';
import {Product} from "./models/productModel.js";
import {User} from "./models/userModle.js";

export const sampleProducts:Product[]=[
    {
        name:'Nike Slim shirt',
        slug:'nike-slim-shirt',
        image:'../images/p1.jpg',
        category:'Shirt',
        brand:'Nike',
        price:120,
        virtualCountInStock:10,
        realCountInStock:10,
        description:'high quality shirt',
        rating:4.5,
        numReviews:10
    }
]

export const  sampleUsers: User[] = [
    {
        name: 'Pravinda',
        email: 'admin@example.com',
        password: bcrypt.hashSync('123456'),
        isAdmin: true,
    },
    {
        name: 'Kasun',
        email: 'user@example.com',
        password: bcrypt.hashSync('123456'),
        isAdmin: false,
    },
    {
        name: 'asd',
        email: 'asd@example.com',
        password: bcrypt.hashSync('123456'),
        isAdmin: false,
    }
]