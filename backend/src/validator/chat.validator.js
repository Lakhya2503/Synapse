import { body } from 'express-validator'


const createGroupChatValidator = () => {
    return [
        body("name").trim().notEmpty().withMessage("Group name is required"),
        body("participants")
        .isArray({ min: 2, max: 100})
        .withMessage("Participant must be an array with more than 2 members and less than 100 members")
    ]
}


const updateGroupChatNameValidator = () =>{
    return [
        body("name").trim().isEmpty().withMessage("Group name is required")
    ]
}

export {
    createGroupChatValidator,
    updateGroupChatNameValidator
}

