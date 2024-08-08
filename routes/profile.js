const express = require("express");
const router = express.Router();
const Profile =  require("../models/profile_model");
const middleware = require("../middleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, req.decoded.username + ".jpg");
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 6,
  },
  // fileFilter: fileFilter,
});

// adding and updating profile image
router
  .route("/add/image")
  .patch(middleware.checkToken, upload.single("img"), async (req, res) => {
    try {
      const profile = await Profile.findOneAndUpdate(
        { username: req.decoded.username },
        {
          $set: {
            img: req.file.path,
          },
        },
        { new: true }
      );

      if (!profile) {
        return res.status(404).send({ message: "Profile not found" });
      }

      const response = {
        message: "Image successfully updated",
        data: profile,
      };
      return res.status(200).send(response);
    } catch (err) {
      return res.status(500).send(err);
    }
  });



router.route("/add").post(middleware.checkToken  ,async(req,res)=>{
    try {
        const profile = new Profile({
            username: req.decoded.username,
            name: req.body.name,
            profession: req.body.profession,
            DOB: req.body.DOB,
            titleline: req.body.titleline,
            about: req.body.about
        });
        await profile.save();
        console.log("profile stored");
        res.status(200).json("ok");
    } catch (err) {
        console.error("Error registering profile:", err);
        res.status(403).json({ msg: err.message });
    }
});

router.route("/checkProfile").get(middleware.checkToken , async(req,res)=>{
    try{ 

      const result = await Profile.findOne({username : req.decoded.username});
      if(result){
         return res.json({ Status : true});
      }

      return res.json({Status: false});

    }catch(err){
      return res.status(500).json({ msg: err.message });
    } 

});

router.route("/getData").get(middleware.checkToken , async(req,res)=> {
    try{
      var result = await Profile.findOne({username: req.decoded.username});
      if(result){
          return res.json(result);
      }

      return res.status(200).json(result);
    }catch(err){
      return res.json({err: err});
    }
});

router.route("/getAllUsers").get(middleware.checkToken , async(req,res)=>{
  try{
    var result = await Profile.find({ username: { $ne: req.decoded.username } });

    if(result){
        return res.json({result});
    }

    return res.status(200).json({});
  }catch(err){
    return res.json({err: err});
  }
});

router.route("/getProfile/:username").get(async(req,res)=>{
  try{
    const result = await Profile.findOne({username: res.params.username});

    if(result.length>0){
        res.json({result});
    }else{
        res.json({});
    }

  }catch(e){
     res.json({e:e});
  }
})

router.route("/update").patch(middleware.checkToken , async(req,res)=> {
   try{
    
    let profile = {};
    var result = await Profile.findOne({username: req.decoded.username});
      if(result){
          profile = result;
      }else{
          profile = {};
      }

  var ans = await Profile.findOneAndUpdate({username: req.decoded.username}, {

        $set:{
           name: req.body.name ? req.body.name: profile.name,
           profession: req.body.profession ? req.body.profession : profile.profession,
           DOB: req.body.DOB ? req.body.DOB : profile.DOB,
           titleline: req.body.titleline ? req.body.titleline : profile.titleline,
           about: req.body.about ? req.body.about : profile.about,
        }
        
    });

    if(ans) return res.json({data: result});
    else return req.json({data: []});

   }catch(err){
      return res.json({data: result});
   }

});

router.route("/updatepassword/:username").patch(async(req,res)=> {
  try{
   
   let profile = {};
   var result = await Profile.findOne({username: req.params.username});
     if(result){
         profile = result;
     }else{
         profile = {};
     }

 var ans = await Profile.findOneAndUpdate({username: req.params.username}, {

       $set:{
          password: req.body.password ? req.body.password: profile.password,
       }
       
   });

   if(ans) return res.json({data: result});
   else return req.json({data: []});

  }catch(err){
     return res.json({data: result});
  }

});

router.route("/delete").delete(middleware.checkToken , async(req,res)=>{
  try{
      var result = await Profile.findOneAndDelete({username: req.decoded.username});
      if(!result){
        return res.status(404).json({msg: "User not found"});
    }

    const msg={
        msg: "Profile deleted",
        username: req.params.username,
    };
    return res.json(msg);
  }catch(err){
    return res.status(500).json({msg: err.mmessage});
  }
})

module.exports = router;