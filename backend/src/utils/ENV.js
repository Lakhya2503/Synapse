import { config } from "dotenv";

config({
   path :  './.env' ,
   quiet : true
  })


    export const ENV  = {
      PORT  :  process.env.PORT,
      APP_NAME  :  process.env.APP_NAME,
      CORS_ORIGIN  :  process.env.CORS_ORIGIN,
      NODE_ENV  :  process.env.NODE_ENV,
      EXPRESS_SESSION_SECRET  :  process.env.EXPRESS_SESSION_SECRET,
      FORGET_PASSWORD_REDIRECT_URL  :  process.env.FORGET_PASSWORD_REDIRECT_URL,
      REDIS_URL  :  process.env.REDIS_URL,
      REDIS_PUBLIC_ENDPINT  :  process.env.REDIS_PUBLIC_ENDPINT,
      CLIENT_SSO_REDIRECT_URL  :  process.env.CLIENT_SSO_REDIRECT_URL,
      MONGODB_URI  :  process.env.MONGODB_URI,
      ACCESS_TOKEN_SECRET  :  process.env.ACCESS_TOKEN_SECRET,
      REFRESH_TOKEN_SECRET  :  process.env.REFRESH_TOKEN_SECRET,
      ACCESS_TOKEN_EXPIRY  :  process.env.ACCESS_TOKEN_EXPIRY,
      REFRESH_TOKEN_EXPIRY  :  process.env.REFRESH_TOKEN_EXPIRY,
      CLOUDINARY_API_SECRET  :  process.env.CLOUDINARY_API_SECRET,
      CLOUDINARY_API_KEY  :  process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_URI  :  process.env.CLOUDINARY_URI,
      CLOUDINARY_CLOUD_NAME  :  process.env.CLOUDINARY_CLOUD_NAME,
      MAILSTREP_SMTP_SECREAT  :  process.env.MAILSTREP_SMTP_SECREAT,
      MAILSTREP_SMTP_HOST  :  process.env.MAILSTREP_SMTP_HOST,
      MAILSTREP_SMTP_USER  :  process.env.MAILSTREP_SMTP_USER,
      MAILSTREP_SMTP_PASS  :  process.env.MAILSTREP_SMTP_PASS,
      MAILSTREP_SMTP_PORT  :  process.env.MAILSTREP_SMTP_PORT,
      GOOGLE_CLIENT_ID  :  process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET  :  process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL  :  process.env.GOOGLE_CALLBACK_URL,
      GITHUB_CLIENT_ID  :  process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET  :  process.env.GITHUB_CLIENT_SECRET,
      GITHUB_CALLBACK_URL  :  process.env.GITHUB_CALLBACK_URL
    }
