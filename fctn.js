const express = require("express")

const dotenv = require("dotenv").config()

const mongoose = require("mongoose")

const bcrypt = require("bcrypt")

const jwt = require("jsonwebtoken")

const { User, Wallet } = require("../walletModel/model")




const handleSignup = async (req, res,) => {

    const { fullname, email, password, username } = req.body
    try {

         // validating data sent
    if(!fullname) {
        return res.status(400).json({ ssage: "Please, Enter your Full name" })  }
           
                
     if (!email) {
        return res.status(400).json ({message:" Eneter a valid Email"})}
    else if(!isValidEmail(email)){
        return res.status(400).json({message:"Invalid email"}) }

                
    const exsitingUser = await User.findOne({email})
     if(exsitingUser){
        return res.status(400).json ({message:"User already exist!"}) }
            
    const hashedPassword = await bcrypt.hash( password, 12)
            
    const user = new User({ email, username, password:hashedPassword })
            
     await user.save();
            
    const wallet = new Wallet({ userId: username})
            
        await wallet.save();
    
            res.status(201).json({
                        message: "Registration succesful", 
                        username, userId: user._id, email, wallet})
            
   } catch (err) {
         res.status(400).json({ error: err.message }) }

   }

   const handleGetAllUsers = async (req, res) => {
    
    const users = await User.find()

    return res.status(200).json({
        message: "Successful",
        count: users.length,
        users
    })
}

  const handleLogin =  async (req, res) => {
    const { username, password } = req.body
    try {
         const user = await User.findOne({ username })
        if (!user) 
            return res.status(401).json({ error: 'Invalid username or password' })

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) 
            return res.status(401).json({ error: 'Invalid username or password' })

        // If authentication is successful, generate the token
        const userPayload = { username: username }
        const accessToken = jwt.sign(userPayload, process.env.userToken, 
            { expiresIn: '2h' });

        // Send the token in the response
       
        return res.status(200).json({
            message: "Successful",
            accessToken,
            user:{userId: user._id, username}
        })

  
    } catch (err) {
        
        res.status(500).json({ error: err.message })
    }
}


const authenticateToken = async (req, res, next) => {
    try {
      const token = req.header('Authorization') // Corrected header name
        if (!token) return res.status(401).json({ error: 'Token required' })
        
       const verifiedToken = jwt.verify(token, process.env.userToken );
        if (!verifiedToken) return res.status(403).json({ error: 'Invalid token' });
        
     const user = await User.findOne({ username: verifiedToken.username }) // Find user in database
        if (!user) return res.status(401).json({ error: 'User not found' })
        
        req.user = user; // Set user in request object for later use
            next()
        
    } catch (err) {
        // Handle errors
    res.status(500).json({ error: err.message })
            }
        }

const handleFunding = async (req, res) => { 

    const token = req.headers.authorization

    if(token != authenticateToken){
        return res. status(400).json({message: "Unauthrosized user"})
    }


        const { amount } = req.body
        if (amount <= 0) return res.status(400).json(
            { message: 'Amount must be greater than zero' })

        try {
    
            const userId = authenticateToken.username

            
            //  const updatedUser = await Wallet(userId, amount)

             const wallet = new Wallet({ userId: username, amount})

             wallet += amount
            
             await wallet.save();
        
            return res.status(200).json(
                {message: "wallet funded sucessfully", wallet})
    
               
    } catch (err) {
        // Handle errors
        res.status(500).json({ error: err.message })
    }
    
    }

//    const handleWithdrawal = async (req, res) => {
//         try {
//         const { amount } = req.body
//         if (amount <= 0) return res.status(400).
//         json({ error: 'Amount must be greater than zero' })
    
        
//             const wallet = await Wallet.findOne({ userId: req.user.userId })
//             if (wallet.balance < amount) return res.status(400).
//             json({ error: 'Insufficient funds' })
    
//             wallet.balance -= amount
//             await wallet.save()
//             res.json(wallet)
//         } catch (err) {
//             res.status(500).json({ error: err.message })
//         }
//     }
    


const isValidEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    return emailPattern.test(email)
};

  module.exports = {
                handleSignup, 
                handleLogin,
                handleGetAllUsers,
                handleFunding,
                isValidEmail
                

  }