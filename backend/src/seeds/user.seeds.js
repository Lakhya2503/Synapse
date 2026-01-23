import { faker } from '@faker-js/faker'
import fs from 'fs'
import { USER_COUNT } from './_constants.js'
import { AvailableUserRoles } from '../constant.js'
import {getRandomNumber, removeLocalFile} from '../utils/helper.js'
import asyncHandler from '../utils/asyncHandler.js'
import User from '../model/user.model.js'
import logger from '../logger/wintson.logger.js'
import ApiRespose from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'


const users = new Array(USER_COUNT).fill("_").map(() => ({
    avatar : faker.image.avatar(),
    username: faker.person.firstName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    isEmailVerified: true,
    role : AvailableUserRoles[getRandomNumber(2)]
}))

const seedsUser = asyncHandler(async (req, res, next) => {
    const userCount = await User.count();
    if (userCount >= USER_COUNT) {
        next();
        return;
    }

    await User.deleteMany({})
    
    removeLocalFile('./public/temp')

    const credentials = [];

    const userCreationPromise = users.map(async (user) => {
        credentials.push({
            username: user.username.toLowerCase(),
            password: user.password,
            role : user.role
        })

        await User.create(user)
    })


    await Promise.all(userCreationPromise)


    const json = JSON.stringify(credentials)

    fs.writeFileSync(
        './public',
        json,
        'uft8',
        (err) => {
            logger.error(`ERROR WHILE WRITING THE CREDENTIALS`, err)
        }
    )

    next()
    
})

const getGeneratedCredentials = asyncHandler(async (req, res) => {
    try {
        const json = fs.readFileSync('./public', 'utf8')
        return res
            .status(200)
            .json(
                new ApiRespose(
                    200,
                    JSON.parse(json)
                    `DUMMY CREADIENTIALS FETCH SUCCESSFULLY`
                )
            )
    } catch (error) {
        throw new ApiError(
            404,
            `NO creadentials genrated yet Make sure you have seeded social media or ecommers api data first which genrated users as dependiecies`
        )
    }
})


export {
    getGeneratedCredentials,
    seedsUser
}

