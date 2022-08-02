const express = require("express")
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./model/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
require('dotenv').config();                // deploying time -> to use functionalities of env

const app = express()
app.use(cors())                                                        // just to allow communication b/w cross origin (client and server on diff server/local host port ) // not needed on production
app.use(express.json())                                               // parse any thing that comes into req.body into json

mongoose.connect('mongodb+srv://sahil:sahil123@cluster0.6mb70ra.mongodb.net/login-reg?retryWrites=true&w=majority')             // google moogose.connect  to goto documentation

// setting route

/*    post req on baseurl/api/register    ->> for registering             */

    app.post('/api/register', async (req,res)=>{
        console.log(req.body)
        try{
            
            const encPass = await bcrypt.hash(req.body.password, 10);         // 10 cycles can be any 
            // const user = await User.create(req.body);         
            const user = await User.create({
                name:  req.body.name,
                email:  req.body.email,
                password:  encPass,
            })
            res.json({status:'ok'})
        }
        catch(err){
            res.json({status:'error', error: 'duplicate email'})
        }
    })



    // post request on baseurl/api/login                        ->> for user login

    app.post('/api/login', async (req,res)=>{
        const user = await User.findOne({
            email: req.body.email,
            // password: req.body.password,           // matching email, pass when pass was stored as string.
        })
        
        if(!user){
            return  res.json({ status:'error', user: fakse})
        }
        
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        
        if(isPasswordValid){
              
            // generting token
            const token = jwt.sign(
                {                       // jwt authentication  // payload
                    name: user.name, 
                    email:user.email,
                },
                'secret123'            //signature
            )
            return  res.json({ status:'ok', user: token})                  // return is optional  as res.json() returns object after converting to josn 
        }
    })





    /*    get // req on baseUrl/api/quote                          ->> to get the quote.        */

    app.get('/api/quote', async (req,res)=>{
        
        const token = req.headers['x-access-token']

        try{
            const decoded = jwt.verify(token, 'secret123')
            const email = decoded.email
            const user = await User.findOne({email: email})          // fetch record form DB
            // console.log(email)
            return res.json({status:'ok', quote: user.quote});
        }
        catch(err){
            // console.log(err);
            res.json({status:'error', error: 'invalid-token'})
        }
    })
    




    /*          post : req on baseUrl/api/quote                              ->> to set the quote.     */

    app.post('/api/quote', async (req,res)=>{
        
        const token = req.headers['x-access-token']

        // perform authentication
       
        try{
            const decoded = jwt.verify(token, 'secret123')
            const email = decoded.email

            console.log(decoded);
            console.log(req.body.quote);
            await User.updateOne(                               // update quote in DB
                {email: email}, 
                {$set: {quote: req.body.quote}}
            )

            return res.json({status:'ok'});
        }
        catch(err){
            res.json({status:'error', error: 'invalid-token'})
        }
    })
    
    



// start the server (long running process)
app.listen(process.env.PORT || 1337, ()=>{
    console.log('server started on 1337 ')
})

/*
      problem:  not a good practice  to sotre passwords as string as if our DB gets compromized it wi'll be disaster.
      sol ->  use any encription library like bcrpytjs

       - const encPass = await bcrypt.hash(req.body.password, 10);              // store this encrypted password.
*/
/*    dotenv
 -> heroku creates an env file which holds the port where our server side program will be running 
    dotenv is used to get that 

*/