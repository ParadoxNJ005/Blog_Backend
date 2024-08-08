const express = require('express');
const router  = express.Router();
const BlogPost = require("../models/blogpost_model");
const middleware = require("../middleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, req.params.id + ".jpg");
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

//-------------------------------------------- adding and updating profile image ------------------------------------
router.route("/add/image/:id").patch(middleware.checkToken, upload.single("img"), async (req, res) => {
    try {
      const profile = await BlogPost.findOneAndUpdate(
        { username: req.decoded.username },
        {
          $set: {
            coverImage: req.file.path,
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


//------------------------Add a blog---------------------------------------------
router.route("/add").post(middleware.checkToken, async(req,res)=>{
    try{
        const blogpost = BlogPost({
            username: req.decoded.username,
            title: req.body.title,
            body: req.body.body,
        });
        const result =  await blogpost.save();
        if(result){
            res.json({data: result});
        }
    }catch(err){
        return res.json({err: err});
    }
});

//-------------------------find a blog by id------------------------------------------
router.route("/find/:id").get(middleware.checkToken, async(req,res)=>{
    try{
        // const result = await BlogPost.findOne({username: req.decoded.username});
        const result = await BlogPost.findOne({_id: req.params.id});
        if(result){
            return res.json({status : true});
        }

        return res.json({status : false});
    }catch(err){
        return res.json({status:false , err: err});
    }
});

//-------------------------delete the blog------------------------------------
router.route("/delete").delete(middleware.checkToken, async(req,res)=>{
    try{
        const result = await BlogPost.delete({username: req.decoded.username});
        if(result){
            return res.json({status : true});
        }

        return res.json({status : false});
    }catch(err){
        return res.json({status:false , err: err});
    }
});

//-------------------------delete the blog by id------------------------------------
router.route("/delete/:id").delete(middleware.checkToken, async (req, res) => {
  try {
      const result = await BlogPost.findByIdAndDelete(req.params.id);
      if (result) {
          return res.json({ status: true });
      } else {
          return res.json({ status: false, message: "Blog post not found" });
      }
  } catch (err) {
      return res.json({ status: false, err: err });
  }
});

//-------------------------get own blog----------------------------------------
router.route("/myblog").get(middleware.checkToken, async (req, res) => {
  try {
      const result = await BlogPost.find({ username: req.decoded.username });
      if (result.length > 0) {
          return res.json({ data: result });
      } else {
          return res.json({ data: [] });
      }
  } catch (err) {
      return res.json({ err: err });
  }
});

//-------------------------get all blogs----------------------------------------
router.route("/allblog").get(async (req, res) => {
  try {
      const result = await BlogPost.find();
      if (result.length > 0) {
          return res.json({ data: result });
      } else {
          return res.json({ data: [] });
      }
  } catch (err) {
      return res.json({ err: err });
  }
});

//-------------------------Edit Your Own Blog----------------------------------------
router.route("/updateblog/:id").patch(async (req, res) => {
  try {
    let profile = {};
    
    var ans = await BlogPost.findOne({ _id: req.params.id });

    if (ans) {
      profile = ans;
    } else {
      profile = {};
    }

    const result = await BlogPost.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          title: req.body.title ? req.body.title : profile.title,
          body: req.body.body ? req.body.body : profile.body,
          coverImage: req.body.coverImage ? req.body.coverImage : profile.coverImage,
        },
      },
      { new: true } 
    );

    if (result) {
      return res.json({ data: result });
    } else {
      return res.json({ data: [] }); 
    }
  } catch (err) {
    return res.json({ err: err }); 
  }
});



module.exports = router;