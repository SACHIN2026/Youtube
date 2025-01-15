import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:  process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (file) => {
    try{
        if(!file){
            return null;
    }
    // Upload image to cloudinary
    const response = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
    })
    //file is uploaded successfully
    console.log("File uploaded successfully",response);
    return response;
}
    catch(error){
        fs.unlinkSync(file)// remove tthe file store
        //  locally if file file upload failed
        return null;
    }

}

export default uploadOnCloudinary;