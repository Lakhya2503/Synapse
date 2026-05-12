import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ApiError from './ApiError.js';
import { ENV } from './ENV.js';


cloudinary.config({
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
});



const uploadFiles = async function (localFilePath) {
    try {
        if (!localFilePath) {
            throw new ApiError(404, "localFile not found")
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        //  (`localFilePath was ${response.url}`);
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        throw new ApiError(404, error.message || 'local file not found')
    }


}

export default uploadFiles
