import { body } from 'express-validator';

export const registerValidation = [
    body('email', 'Error Email').isEmail(),
    body('password', 'Error password min 6 s').isLength({min: 6}),
    body('name', 'Error name min 3 s').isLength({min: 3}),
   

];

export const loginValidation = [
    body('email', 'Error Email').isEmail(),
    body('password', 'Error password min 6 s').isLength({min: 6}),
];