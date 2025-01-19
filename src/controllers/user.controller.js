import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken  = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};


    } catch (error) {
        throw new ApiError(500, "Something went wrong while trying to generate access token and refresh token");
        
    }
}

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

export const loginUser = asyncHandler(async(req, res)=>{
    //req
    const {username, email, password} = req.body;

    if(!(username || email)){
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    // our defined user is -> user
    // from mongodb user  -> User

    const isPasswordCorrect = await user.isPasswordCCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid password");
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const loggedUser = await User.findById(user._id).
    select("-password -refreshToken");
    // we are not sending password and refreshToken in response

    const options = {
        httpOnly: true,
        secure: true,
    }
    // we are setting cookie with httpOnly and secure options
//not able to get refresh token in cookie
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200,
        {user:loggedUser, accessToken,refreshToken}, 
        
         "User logged in successfully"
        ));

})

export const loggedOutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id, 
        {
            $set: {refreshToken: undefined}
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
})

export const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.accessToken || req.body.refreshToken;
    // we are checking if refresh token is in cookie or in request body
    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const deocdedToken = jwt.verify(incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        );
    
        const user = await User.findById(deocdedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token");
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Invalid refresh token or expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const {accessToken, newrefreshToken} = await generateAccessTokenAndRefreshToken(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {accessToken, newrefreshToken}, "Access token refreshed successfully")
    );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
        
    }

})

// export {registerUser};