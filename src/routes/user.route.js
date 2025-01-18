import {Router} from 'express';
import {registerUser, loginUser} from  "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {loggedOutUser} from "../controllers/user.controller.js";

const router = Router();

console.log('registerUser:', registerUser); // Should log the function definition

router.route('/register').post(
    upload.fields([{
        name:"avatar", maxCount: 1
    },{
        name:"coverImage", maxCount: 1

    }]), registerUser);

   router.route('/login').post(loginUser);

   //secure route
   router.route("/logout").post(verifyJWT, loggedOutUser);


export default router;