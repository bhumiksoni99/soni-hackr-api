const { check } = require('express-validator')

//the name in check('name') is the variable name which you send from the client side

const userRegisterValidator = [
    check('name').not().isEmpty().withMessage('Name is required.'),

    check('email').isEmail().withMessage('Enter a valid email address.'),

    check('password').isLength({min:6}).withMessage('Password must be atleast 6 characters.'),

    check('categories').not().isEmpty().withMessage('Pick a category.')
]
const userUpdateValidator = [
    check('name').not().isEmpty().withMessage('Name is required.')
]
const userLoginValidator = [
    check('email').isEmail().withMessage('Enter a valid email address.')
]

const forgotPasswordValidator = [
    check('email').isEmail().withMessage('Enter a valid email address.')
]

const resetPasswordValidator = [
    check('newPassword').isLength({min:6}).withMessage('Password must be atleast 6 characters.'),
    check('token').not().isEmpty().withMessage('Token is required.')
]


module.exports = {
    userRegisterValidator,
    userLoginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    userUpdateValidator
}