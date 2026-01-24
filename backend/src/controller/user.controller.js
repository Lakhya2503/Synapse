import jwt from 'jsonwebtoken';
import { userLoginType } from "../constant.js";
import User from "../model/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadFiles from "../utils/cloudinary.js";
import {
    emailVerificationMailgenContent,
    forgetPasswordMailgenContent,
    sendMail
} from "../utils/mail.js";
import OTPGenerate from './../utils/OTPgenerate.js';


let storeOTP = ''


const generateAccessRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const createAccount = asyncHandler(async (req, res) => {

   (` req ${req}`);

  const {
    username,
    password,
    email,
  } = req.body;

  //  (`req.body : ${req.body}`);


  //  (`username : ${username} ; password : ${password} ; email : ${email}`);




  // Validate required fields
  const requiredFields = [
    username,
    password,
    email,
  ];
  if (requiredFields.some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const userExists = await User.exists({ $or: [{ username }, { email }] });
  if (userExists) throw new ApiError(400, "User already exists");

  // Handle avatar upload
  if (!req.files || !req.files.avatar || !req.files.avatar[0].path) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarFile = await uploadFiles(req.files.avatar[0].path);
  if (!avatarFile || !avatarFile.url) {
    throw new ApiError(500, "Failed to upload avatar file");
  }

  // Create user
  const user = await User.create({
    username,
    avatar: avatarFile.url,
    password,
    email,
    isEmailVerified : false,
  });

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()

  user.emailVerificationToken = hashedToken
  user.emailVerificationExpiry = tokenExpiry

  //  (`email : ${user.email}`);
  //  (`username : ${user.username}`);
  //  (`user verification url : ${req.protocol}://${req.get(
  //         "host"
  //     )}/synapse/v1/users/verify-email${unHashedToken}`);


  await sendMail({
    email : user?.email,
    subject : "please verify your email",
    mailContent : emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
          "host"
      )}/synapse/v1/users/verify-email${unHashedToken}`
    )
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser) throw new ApiError(500, "Sorry — your account couldn’t be created. Please try again");

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "Success! Your SYNAPSE account is ready."));
});

const generateOTP = asyncHandler(async(req, res) => {
    try {
        const otp = OTPGenerate()
         (`Generated OTP: ${otp}`)

        // Store OTP (you might want to associate it with user's email/ID)
        storeOTP = otp

        // Assuming you have user email and name from request/authentication
        // You'll need to modify this based on how you get user info
        const userEmail = req.user?.email || req.body?.email
        const username = req.user?.username || req.body?.username

        //  (`userEmail : ${userEmail}`);
        //  (`username : ${username}`);


        if (!userEmail) {
            return res
                .status(400)
                .json(new ApiError(400, 'User email is required'))
        }

        // Generate verification URL (modify as per your frontend route)
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/users/verify-otp?otp=${otp}&email=${userEmail}`

         (`verificationURL :${verificationUrl}`);


        // Send OTP email
        // const emailSent = await sendOTPVerificationEmail(
        //     userEmail,
        //     username || 'User',
        //     verificationUrl,
        //     otp
        // )

        //  (`email :${emailSent}`);


        // if (!emailSent) {
        //     return res
        //         .status(500)
        //         .json(new ApiError(500, 'Failed to send OTP email'))
        // }



         (`OTP ${otp} sent to ${userEmail}`)

        // Don't send OTP in response for security - only send success message
        res
            .status(200)
            .json(new ApiResponse(200, otp, 'OTP sent successfully to your registered email'))

    } catch (error) {
        console.error('Error in generateOTP:', error.message)
        res
            .status(500)
            .json(new ApiError(500, 'Error generating and sending OTP'))
    }
})

const verifyUserEmailAndOTP = asyncHandler(async(req,res)=>{

     (` storeOTP : ${storeOTP} `);

  const { otp } = req.body

   (` otp from body : ${otp} `);

  if(otp !== storeOTP) {
    throw new ApiError(400, "The OTP you entered is incorrect");
  }

    const user = await User.findById(req.user?._id).select("-password -refreshToken")

    if(!user) {
      throw new ApiError(401, "user not found")
    }

      user.emailVerificationToken = "undefiend"
      user.emailVerificationExpiry = "undefiend"

      user.isEmailVerified = true
      const  confirmOTP = user.OTP = otp


      await user.save({
        validateBeforeSave : false
      })

     return res
      .status(200)
      .json(new ApiResponse(200, confirmOTP, "Email and OTP verified successfully"))
})

const loggedInUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(email || username))
    throw new ApiError(400, "Username or email is required");
  if (!password) throw new ApiError(400, "Password is required");

  const findUser = await User
    .findOne(
      {
        $or: [{ username }, { email }]
      }
    );

    //  (`user ${findUser}`);



  if (!findUser) throw new ApiError(404, "That user doesn’t seem to exist.");

    if(findUser.loginType !== userLoginType.EMAIL_PASSWORD){
      throw new ApiError(
        400,
        `you have previously register using`,
        findUser.loginType?.toLocaleLowerCase() + '.please use the' + findUser.loginType.toLowerCase() + 'login options to access your account'
      )
    }

  const isPasswordCorrect = await findUser.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiError(400, "Wrong password — check it and try again.");

  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    findUser._id
  );

  //  (`accessToken , ${accessToken}`);
  //  (`refreshToken , ${refreshToken}`);



  const user = await User.findById(findUser._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, {user, accessToken, refreshToken}, "Welcome back to SYNAPSE 🫠")); // the accessToken and refreshToken in response  if clinet decide to save themeself
});

const loggedOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user?._id, {
    $unset: {
        refreshToken : 1
    },
  },{
      new : true,
  })
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, "Logout successful"))
})

const getUser = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id

  if (!currentUserId) {
    throw new ApiError(404, "User Token Not Found")
  }

  const user = await User.findById(currentUserId).select("-refreshToken -password")

  if (!user) {
    throw new ApiError(400, "USER NOT FOUND")
  }
  return res.status(200).json(new ApiResponse(200, user, "User data retrieved successfully.."))
})

const forgetPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(400, "USER NOT EXIST")
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken
  user.forgotPasswordExpiry = tokenExpiry

  await user.save({ validateBeforeSave: false })

  sendMail({
    email: user?.email,
    subject: `Password reset successful. You can now log in.`,
    mailContent: forgetPasswordMailgenContent(
      user.username,
      `${process.env.FORGET_PASSWORD_REDIRECT_URL}/${unHashedToken}`
    ),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, `Password reset email sent. Follow the link to continue. `))
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
     const { oldPassword, newPassword } = req.user;

     const user = await User.findById(req?._id);

     const isPasswordValid = await user.isPasswordCorrect(oldPassword);

     if (!isPasswordValid) {
       throw new ApiError(400, "Incorrect password. Please try again.");
     }

     user.password = newPassword;

     return res
       .status(200)
       .json(new ApiResponse(200, {}, `All set! Your password has been updated.`));
})

const updateUsername = asyncHandler(async (req, res) => {
  const { newUsername } = req.body

  const user = await User.findById(req.user._id)

  if (!user) {
    throw new ApiError(400, `User not found. Please check the details and try again.`)
  }

  const updateUsername = await User.findByIdAndUpdate(req.user.id, {
    $set: {
        username : newUsername
    },
  },
  {new : true}
).select('-password -refreshToken')


  return res
    .status(200)
    .json(new ApiResponse(200, updateUsername, "Username change successful"))
})

const updateUserFullName = asyncHandler(async (req, res) => {
  const { newFullName } = req.body

    const user = await User.findById(req.user?._id)

  if(!user) {
    throw new ApiError(400, "User record does not exist.")
  }

  const updaateFullname = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: newFullName,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updaateFullname, "Full name updated successfully. You can continue using SYNAPSE")
    );

})

const updateUserAvatar = asyncHandler(async (req, res) => {

  if (!req.file?.filename) {
    throw new ApiError(400, "Don’t forget to add an avatar!")
  }

  const avatarFile = req.file?.path

  if (!avatarFile) {
    throw new ApiError(400,  `Oops! We can’t find that avatar.`)
  }

  const avatar = await uploadFiles(avatarFile)

  if (!avatar) {
    throw new ApiError(400, "Error during file upload")
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      avatar : avatar.url
    }
  }, { new: true }).select('-password -refreshToken')

      return res.status(200).json(new ApiResponse(200, user, "User avatar updated successfully"))
})

const accessRefreshToken = asyncHandler(async(req,res)=>{
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incommingRefreshToken) {
        throw new ApiError(401, `Unauthrized request`)
    }

    try {

        const decodedToken =jwt.verify(
            incommingRefreshToken,
            process.env.REFRESH_TOKEN
        )

        const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401, "invalid refresh Token")
    }

    if(incommingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "refresh Token is expired or used")
    }

    const options = {
        httpOnly : true,
        secure : process.env.NODE_ENV === "production"
    }

    const { accessToken, refreshToken : newRefreshToken } = generateAccessRefreshToken(user._id)

    user.refreshToken = newRefreshToken
    await user.save()

    return res
        .status(200)
        .cookies('accessToken', accessToken, options)
        .cookies("refreshToken", newRefreshToken, options)
        .json(
            new ApiRespose(200, {
                accessToken,
                refreshToken : newRefreshToken,
            },
            "Access Token refreshed"
        )
        )

    } catch (error) {
        throw new ApiError(401, error.message || "Invalid refresh Token")
    }


})

// const deleteUser = asyncHandler(async (req, res) => {
// });


export {
    accessRefreshToken, changeCurrentPassword, createAccount, forgetPasswordRequest, generateAccessRefreshToken, generateOTP, getUser, loggedInUser,
    loggedOutUser, updateUserAvatar, updateUserFullName, updateUsername, verifyUserEmailAndOTP
};
