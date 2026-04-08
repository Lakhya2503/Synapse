import ApiRespose from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";



const checker = asyncHandler(async(req,res)=>{
   const fakeUser = {
        username: "fake_user_123",
        email: "fakeuser123@example.com",
        avatar: "https://fakeurl.com/avatar.png",
        fullName: "Fake User",
        id: "user_001"
      };

    return res.status(200).json(new ApiRespose(200, {user: fakeUser}, "fake user fetch"))
})


export default checker
