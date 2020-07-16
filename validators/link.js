const { check } = require('express-validator')

//the name in check('name') is the variable name which you send from the client side

const LinkCreateValidator = [
    check('title').not().isEmpty().withMessage('Title is required.'),

    check('url').not().isEmpty().withMessage('Url is required.'),

    check('categories').not().isEmpty().withMessage('Pick a category.'),

    check('type').not().isEmpty().withMessage('Pick a type- Free/Paid'),

    check('medium').not().isEmpty().withMessage('Medium is required.'),

]

const UpdateLinkValidator = [
    check('title').not().isEmpty().withMessage('Title is required.'),

    check('url').not().isEmpty().withMessage('Url is required.'),

    check('categories').not().isEmpty().withMessage('Pick a category.'),

    check('type').not().isEmpty().withMessage('Pick a type- Free/Paid'),

    check('medium').not().isEmpty().withMessage('Medium is required.'),

]

module.exports = {
    LinkCreateValidator,
    UpdateLinkValidator
}