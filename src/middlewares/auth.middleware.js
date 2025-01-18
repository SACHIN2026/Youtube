import jwt from 'jsonwebtoken';
import {User} from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';


export const verifyJWT = asyncHandler(async(req,_,next)=>{
    try {
        const token = req.cookies?.accessToken || req.
        header("Authorization")?.replace("Bearer ", "");
    
        if(!token){
            throw new ApiError(401, "You are not authenticated");
        }
    
        const deocdedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(deocdedToken?._id).
        select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,  error?.message ||"You are not authenticated Invalid access token");
        
    }
})