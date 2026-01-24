import Mailgen from 'mailgen'
import nodemailer from 'nodemailer'

const sendMail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: "Synapse",
            link: "localhost:5002"
        },
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailContent)
    const emailHtml = mailGenerator.generate(options.mailContent)

    const transporter = nodemailer.createTransport({
        host: process.env.MAILSTREP_SMTP_HOST,
        port: process.env.MAILSTREP_SMTP_PORT,
        auth: {
            user: process.env.MAILSTREP_SMTP_USER,
            pass: process.env.MAILSTREP_SMTP_PASS,
        },
    })

    const mail = {
        from: process.env.MAIL_FROM || 'mail.synapse@gmail.com',
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }

    try {
        await transporter.sendMail(mail)
        //  ('Email sent successfully')
        return true
    } catch (error) {
        //  ('Error sending email:', error.message)
        return false
    }
}

const forgetPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: `We received a request to reset your password.`,
            action: {
                instructions: `Click the button below to reset your password:`,
                button: {
                    color: '#DC4D2F',
                    text: 'Reset Password',
                    link: passwordResetUrl
                }
            },
            outro: `If you didn't request this, please ignore this email.`
        }
    }
}

const emailVerificationMailgenContent = (username, verificationUrl, otp) => {
    return {
        body: {
            name: username,
            intro: `Welcome to SYNAPSE! 👋 We're excited to have you here.`,
            dictionary: {
                "Your Verification OTP": otp,
                "OTP Valid For": "10 minutes"
            },
            action: {
                instructions: "Use the OTP above or click the button below to verify your email:",
                button: {
                    color: "#22BC66",
                    text: "Verify Your Email",
                    link: verificationUrl
                }
            },
            outro: "If you need assistance or have any questions, simply reply to this email"
        }
    }
}


const sendOTPVerificationEmail = async (email, username, verificationUrl, otp) => {
    const mailContent = emailVerificationMailgenContent(username, verificationUrl, otp)

    return await sendMail({
        email: email,
        subject: "Verify Your Email - SYNAPSE",
        mailContent: mailContent
    })
}


const sendPasswordResetEmail = async (email, username, resetUrl) => {
    const mailContent = forgetPasswordMailgenContent(username, resetUrl)

    return await sendMail({
        email: email,
        subject: "Reset Your Password - SYNAPSE",
        mailContent: mailContent
    })
}

export {
  emailVerificationMailgenContent,
  forgetPasswordMailgenContent, sendMail,
  sendOTPVerificationEmail,
  sendPasswordResetEmail
}
