import {Router} from 'express';
import {registerUser} from  "../controllers/user.controller.js";

const router = Router();

console.log('registerUser:', registerUser); // Should log the function definition

router.post("/register",registerUser);


export default router;