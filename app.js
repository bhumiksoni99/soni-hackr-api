const express = require('express');
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')
const linkRouter = require('./routes/link')
const categoryRouter = require('./routes/category')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')

require('dotenv').config()

const app = express();

//db 
mongoose.connect(process.env.DATABASE_CLOUD,{useNewUrlParser:true,useFindAndModify:true,useUnifiedTopology:true,useCreateIndex:true}).then(() =>{
    console.log('DB Connected')
}).catch(e =>console.log(e))

const PORT = process.env.PORT || 8080

app.use(bodyParser.json({limit:'5mb',type:'application/json'}))
app.use(cors({origin:process.env.CLIENT_URL}))
app.use(morgan('dev'))

app.use(authRouter)
app.use(userRouter)
app.use(categoryRouter)
app.use(linkRouter)

app.listen(PORT,(req,res) => {
    console.log(`Server is running on port ${PORT}`)
})