const emailParams = (email,token,name) => {
    return {
        Source:process.env.EMAIL_FROM,
        Destination:{
            ToAddresses:[email]
        },
        ReplyToAddresses:[process.env.EMAIL_TO],
        Message:{
            Body:{
                Html:{
                    Charset:'UTF-8',
                    Data:`<html>
                             <h1>Account Verification</h1>
                             <p>Hey ${name}.Use the following link to activate your account</p>
                             <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                         </html>`
                }
            },
            Subject:{
                Charset:'UTF-8',
                Data:'Complete your registration'
            }
        }
    }
}

const forgotemailParams = (email,token) => {
    return {
        Source:process.env.EMAIL_FROM,
        Destination:{
            ToAddresses:[email]
        },
        ReplyToAddresses:[process.env.EMAIL_TO],
        Message:{
            Body:{
                Html:{
                    Charset:'UTF-8',
                    Data:`<html>
                             <h1>Reset Password</h1>
                             <p>Click on the below link to reset your password.</p>
                             <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                         </html>`
                }
            },
            Subject:{
                Charset:'UTF-8',
                Data:'Password Reset Link'
            }
        }
    }
}

const linkPublishedParams = (email,categories,link) => {
    return {
        Source:process.env.EMAIL_FROM,
        Destination:{
            ToAddresses:[email]
        },
        ReplyToAddresses:[process.env.EMAIL_TO],
        Message:{
            Body:{
                Html:{
                    Charset:'UTF-8',
                    Data:`<html>
                             <h1>New Link Published || reactnodeaws.com</h1>
                             <p>A new link titled <b>${link.title}</b> has been published in the following categories.</p>
                             
                             ${categories.map(c => {
                                return `
                                <div>
                                    <h2>${c.name}</h2>
                                    <img src="${c.image.url}" alt="${c.name}" style="height:50px;"/>
                                    <h3>
                                        <a href="${process.env.CLIENT_URL}/links/${c.slug}">Check it out!</a>
                                    </h3>
                                </div>
                                `
                             }).join('--------')}

                             <br/>
                             <p>Do not wish to get notifications?</p>
                             <p>Turn off notifications by going to your <b>Dashboard</b> -> <b>Update Profile </b> and <b>Uncheck the categories.</b></p>
                             <p>${process.env.CLIENT_URL}/user/profile/update</p>
                         </html>`
                }
            },
            Subject:{
                Charset:'UTF-8',
                Data:'New Link Published'
            }
        }
    }
}
module.exports = {
    emailParams,
    forgotemailParams,
    linkPublishedParams
}