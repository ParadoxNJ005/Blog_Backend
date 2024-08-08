const express = require("express");
const User = require("../models/users_model");
const config = require("../config");
const jwt = require("jsonwebtoken");
const middleware = require("../middleware")

const router = express.Router();

//---------Find the user-------------------------------------------

router.route("/find/:username").get(middleware.checkToken, async(req,res)=>{
    try{
        const result = await User.findOne({username: req.params.username})
        if(!result){
            return res.status(404).json({msg: "User not found"});
        }
        
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
})

//-------check if the user exists or not----------------------------

router.route("/checkusername/:username").get(async(req,res)=>{
    try{
        const result = await User.findOne({username: req.params.username})
        if(result !== null){
            return res.json({
                Status: true,
            })
        }else{
            return res.json({
                Status: false,
            })
        }
        
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
})

//---------Login the user-------------------------------------------

router.route("/login").post(async (req, res) => {
    try {
        const result = await User.findOne({ username: req.body.username });
        if (!result) {
            return res.status(403).json("Username incorrect");
        }
        if (result.password === req.body.password) {
            let token = jwt.sign({username: req.body.username}, config.key, {
            });

            res.json({
                token: token,
                msg:"success",
            })

        } else {
            return res.status(403).json("Password is incorrect");
        }
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
});


//---------register the user-------------------------------------------

router.post("/register", async (req, res) => {
    console.log(req.body);
    try {
        const user = new User({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
        });

        await user.save();
        console.log("user registered");
        res.status(200).json("ok");
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(403).json({ msg: err.message });
    }
});


//---------update the user password-------------------------------------------

router.route("/update/:username").patch(middleware.checkToken , async (req, res) => {
    try {
        const result = await User.findOneAndUpdate(
            { username: req.params.username },
            { $set: { password: req.body.password } },
            { new: true } // This option returns the updated document
        );
        if (!result) {
            return res.status(404).json({ msg: "User not found" });
        }
        const msg = {
            msg: "Password successfully updated",
            username: req.params.username,
        };
        return res.json(msg);
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
});

//---------delete the user------------------------------------------------------

router.route("/delete/:username").delete(middleware.checkToken , async(req,res)=>{
    
    try{
        const result = await User.findOneAndDelete( {username: req.params.username});
        if(!result){
            return res.status(404).json({msg: "User not found"});
        }

        const msg={
            msg: "Username deleted",
            username: req.params.username,
        };
        return res.json(msg);
    }catch(err){
        return res.status(500).json({msg: err.mmessage});
    }
    
});

//---------Get All User----------------------------------------------------------

router.route("/getallusers").get(async(req,res)=>{
    try{
        const result = await User.find();
        if (result.length > 0) {
            return res.json({ data: result });
        } else {
            return res.json({ error: "User not found", data: [] });
        }

    }catch(err){
        return res.json({err: err});
    }
});


module.exports = router;
