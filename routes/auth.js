const express = require('express')
const router = express.Router()

const {register,activateAccount,login,forgotPassword,resetPassword} = require('../controller/auth')
const {userRegisterValidator,userLoginValidator,forgotPasswordValidator,resetPasswordValidator} = require('../validators/auth')
const {setupValidation} = require('../validators/index')

router.post('/api/register',userRegisterValidator,setupValidation,register)
router.post('/api/register/activate',activateAccount)
router.post('/api/login',userLoginValidator,setupValidation,login)
router.put('/api/forgot',forgotPasswordValidator,setupValidation,forgotPassword)
router.put('/api/reset',resetPasswordValidator,setupValidation,resetPassword)


module.exports = router