const express = require('express');
const middleware = require('../middleware');
const Profile = require('../models/profile_model');
const Message = require('../models/message_model');
const Chat = require('../models/chat_model');
const mongoose = require('mongoose')

const router = express.Router();

//--------------------------------send message to the database---------------------------------------//
router.route("/sendmessage").post(middleware.checkToken, async(req,res)=>{

    const {content , chatId} = req.body;

    if(!content || !chatId){
        console.log("Invalid data passed in request");
        return res.sendStatus(400);
    }

    const currentUser = await Profile.findOne({username: req.decoded.username});

    var newMessage = {
        sender: currentUser._id,
        content: content,
        chat: chatId,
    };

    try{
      var message  = await Message.create(newMessage);

       message = await message.populate("sender", "username img");
       message = await message.populate("chat");
       message = await Profile.populate(message,{
        path: "chat.users",
        select: "username img",
       });

       await Chat.findByIdAndUpdate(req.body.chatId ,{
            latestMessage: message,
       });

       res.json(message);

    }catch(error){
        res.status(400);
        throw new Error(error.message);
    }

});

//-------------------------------fetch the desired message from database----------------------------//
router.route("/fetchmessage/:username").get(middleware.checkToken, async (req, res) => {
    try {
        const currentUser = await Profile.findOne({ username: req.decoded.username });
        const oppositeUser = await Profile.findOne({ username: req.params.username });

        if (!currentUser || !oppositeUser) {
            return res.status(404).json({ error: "Users not found" });
        }

        const chats = await Chat.findOne({
            $and: [
                { users: { $elemMatch: { $eq: currentUser._id } } },
                { users: { $elemMatch: { $eq: oppositeUser._id } } }
            ]
        });

        const chatId = chats._id;
        console.log(chatId);

        const message = await Message.find({
            chat : chatId
        }).populate("sender").populate("chat");
        

        if (message.length > 0) {
            res.json({ message });
        } else {
            res.json({});
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});



module.exports = router;