const { validationResult } = require('express-validator');

const setupValidation = (req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(422).json({
            error:errors.array()[0].msg
        })
    }
    next();
}

module.exports = {
    setupValidation
}   