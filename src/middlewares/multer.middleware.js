import multer from "multer";

const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "./public/temp");
        },
        filename: function (req, file, cb) {
            // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, file.originalname);
            console.log("file", file);//keep file name by your own dont use user uploaded file name
        },
    });
    
    const upload = multer({ storage: storage });
    
    export default upload;