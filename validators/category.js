const { check } = require('express-validator')

//the name in check('name') is the variable name which you send from the client side

const createCategoryValidator = [
    check('name').not().isEmpty().withMessage('Name is required.'),

    check('content').isLength({min:20}).withMessage('Content must have atleast 20 characters.')
]

const updateCategoryValidator = [
    check('name').not().isEmpty().withMessage('Name is required.'),

    check('content').isLength({min:20}).withMessage('Content must have atleast 20 characters.')
]


module.exports = {
    createCategoryValidator,
    updateCategoryValidator
}