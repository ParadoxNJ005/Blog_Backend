const express = require("express");
const router = express.Router();
const middleware = require("../middleware");
const Chat = require("../models/chat_model");
const Profile = require("../models/profile_model");


//-----------------Send the message and make the connection------------------------------------//

router.route("/send").post(middleware.checkToken, async (req, res) => {
    const { userName } = req.body;
    
    if (!userName) {
        console.log("userName param not sent with request");
        return res.sendStatus(400);
    }
    
    try {
        var currentUser = await Profile.findOne({ username: req.decoded.username });
        
        if (!currentUser) {
            return res.status(404).json({ message: "Current user not found" });
        }
        
        var targetUser = await Profile.findOne({ username: userName });
        
        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found" });
        }
        
        var isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: currentUser._id } } },
                { users: { $elemMatch: { $eq: targetUser._id } } },
            ],
        })
        .populate("users")
        .populate("latestMessage");
        
        isChat = await Profile.populate(isChat, {
            path: "latestMessage.sender",
            select: "username img",
        });
        
        if (isChat.length > 0) {
            res.send(isChat[0]);
        } else {
            var chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [currentUser._id, targetUser._id],
            };
            
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users"
            );
            res.status(200).json(FullChat);
        }
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//-----------------fetch the messagr-----------------------------------------------------------//


router.route("/fetch").get(middleware.checkToken, async (req, res) => {
    try {
        const currentUser = await Profile.findOne({ username: req.decoded.username });

        if (!currentUser) {
            console.log("User not found");
            return res.sendStatus(404);
        }

        let result = await Chat.find({
            users: {
                $elemMatch: { $eq: currentUser._id }
            }
        }).populate("users")
          .populate("groupAdmin")
          .populate("latestMessage")
          .sort({ updatedAt: -1 });

        result = await Profile.populate(result, {
            path: "latestMessage.sender",
            select: "username"
        });

        if (result.length > 0) {
            return res.json({result});
        } else {
            return res.json({});
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
