const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

//------------------------------connect to mongo db-------
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://NaitikJain:jainnaitik@cluster0.44aaa6y.mongodb.net/test", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Database connected");
    } catch (error) {
        console.error("error", error);
    }
};
connectDB();

//-------------------------------user route-----------------
const userRoute = require("./routes/user");
app.use("/user", userRoute);

//-------------------------------profile route-----------------
const profileRoute = require("./routes/profile");
app.use("/profile",profileRoute);

//-------------------------------profile route-----------------
const blogRoute = require("./routes/blogpost");
app.use("/blog",blogRoute);

//-------------------------------Chat route-----------------
const chatRoutes = require("./routes/chatRoutes");
app.use("/chat",chatRoutes);

// //-------------------------------Message route-----------------
const messageRoute = require("./routes/messageRoutes");
app.use("/message",messageRoute);

const Port = process.env.Port || 5000;

app.get("/", (req, res) => res.json("your first rest api"));

const server = app.listen(Port, () => console.log(`your server is running on port ${Port}`));

//-----------------------Add Server------------------------//
const io = require("socket.io")(server);

var clients = {};

io.on('connection', (socket)=>{
    console.log("Connected Successfully", socket.id);
    
    socket.on('disconnect',()=>{
        console.log('Disconnected', socket.io);
    });

    socket.on("signin",(id)=>{
        console.log(id);
        clients[id] = socket;
        console.log(clients);
    });

    socket.on('message', (msg) => {
        console.log(msg);
        let targetId = msg.targetId;
        if(clients[targetId]) clients[targetId].emit("message",msg.content);
    });

});

//------------------------------------------------------------//