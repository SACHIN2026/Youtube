import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

export const registerUser = asyncHandler(async (req, res) => {
    //get user detail form frontend
    //validate user detail
    // chech if user exits
    // check for avatar 
    // upload avatar to cloudinary
    // create user object
    // reomve password and refeshToken from user object
    // check for user created
    // send response to frontend

    const { fullname, email, username, password } = req.body
    // console.log(fullname, email, username, password);

    //    if(fullname ===""){
    //     throw new ApiError(400, "Fullname is required");
    //    }
    if (
        [fullname, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");

    }

    const existedUser =  await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with usename or email already exists");
    }

    // console.log(req.files);

     const avatarLocalPath = req.files?.avatar[0]?.path;
    //  const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }


     if(!avatarLocalPath){
         throw new ApiError(400, "Avatar is required");
     }

     // upload avatar to cloudinary
     const  avatar = await uploadOnCloudinary(avatarLocalPath);
     const coverImage = await uploadOnCloudinary(coverImageLocalPath);

     if(!avatar){
            throw new ApiError(500, "Failed to upload avatar");
     }

     if (!username) {
        throw new ApiError(400, "Username is required");
    }
    

     const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url|| "",
        email,
        username: username.toLowerCase(),
        password,
     })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Sometihing went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

});

// export {registerUser};