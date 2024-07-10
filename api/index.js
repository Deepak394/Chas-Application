const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "files/"); // Set the destination folder for storing files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname); // Set the file name to be the original name with a unique suffix
  },
});
const upload = multer({ storage: storage });

mongoose.connect(
  "mongodb+srv://dhimandeepak222:Deepak394@cluster0.f1v9vx1.mongodb.net/"
);
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

const app = express();

app.use(cors("*"));
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

// Serving static files
app.use("/files", express.static(path.join(__dirname, "files")));

app.listen(3000, () => {
  console.log(`Server Started at ${3000}`);
});

const User = require("./models/User");
const Message = require("./models/Message");

//endpoint for registation of the user

app.post("/register", (req, res) => {
  const { name, email, password, image } = req.body;
  //create a new user object
  const newUser = new User({ name, email, password, image });
  // save the user in database
  newUser
    .save()
    .then(() => {
      res.status(200).json({ message: "user created" });
    })
    .catch((err) => {
      console.log("Error register time", err);
      res.status(500).json({ message: " Error registering the user!" });
    });
});

// function to create token
const createToken = (userId) => {
  // set the token payload
  const payload = {
    userId: userId,
  };
  const secretKey = process.env.SECRET_KEY || "default_secret_key";
  // genrate the token with the secret key and expiration time
  const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
  return token;
};

//endpoint  for  login in of that particular user
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  //chech if the email and password is present or not
  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }
  // check for that user in the database

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        // user not found
        return res.status(400).json({ message: "User not found" });
      }
      //compare the provided password with the password in the database
      if (user.password !== password) {
        return res.status(400).json({ message: "Password is incorrect" });
      }
      const token = createToken(user._id);
      res.status(200).json({ token });
    })
    .catch((err) => {
      console.log("Error the finding the user", err);
      res.status(500).json({ message: "Error finding the user" });
    });
});

//endpoint to access all the user accept the user who currently login

app.get("/users/:userId", (req, res) => {
  const loggedInUserId = req.params.userId;

  User.find({ _id: { $ne: loggedInUserId } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log("Error retrieving users", err);
      res.status(500).json({ message: "Error retrieving users" });
    });
});

//endpoit to send a request to the user
app.post("/friend-request", async (req, res) => {
  const { currentUserId, selectedUserID } = req.body;
  try {
    // Update the recipient's friendRequest array
    await User.findByIdAndUpdate(selectedUserID, {
      $push: {
        friendRequest: currentUserId,
      },
    });

    // Update the sender's sendFriendRequest array
    await User.findByIdAndUpdate(currentUserId, {
      $push: {
        sendFriendRequest: selectedUserID,
      },
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing friend request:", error);
    res.sendStatus(500);
  }
});

//endpoit to show all the friends request for a particularuser

app.get("/friend-request/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    //fetch the user document based on the userId
    const user = await User.findById(userId)
      .populate("friendRequest", "name email image")
      .lean();
    const friendRequests = user.friendRequest;

    //send the user document as a response
    res.json(friendRequests);
  } catch (error) {
    console.log("Error retrieving users", error); // Change 'err' to 'error'
    res.status(500).json({ message: "Error retrieving friend request" });
  }
});

//end point to accept the friend request for a particular  person
app.post("/accept-friend-request", async (req, res) => {
  try {
    const { senderId, recepientId } = req.body;

    // Input Validation
    if (!senderId || !recepientId) {
      return res
        .status(400)
        .json({ message: "SenderId and RecipientId are required." });
    }

    // retrieve the document of the sender and the recipient
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recepientId);

    if (!sender || !recipient) {
      return res
        .status(404)
        .json({ message: "Sender or recipient not found." });
    }

    // Update friend lists
    sender.friends.push(recepientId);
    recipient.friends.push(senderId);

    // Remove friend request from recipient and sender
    recipient.friendRequest = recipient.friendRequest.filter(
      (req) => req.toString() !== senderId.toString()
    );
    sender.sendFriendRequest = sender.sendFriendRequest.filter(
      (req) => req.toString() !== recepientId.toString()
    );

    await sender.save();
    await recipient.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error while accepting friend request:", error);
    res.status(500).json({ message: "Error while accepting friend request" });
  }
});
// end point to access all the friends of the logged in user
app.get("/accepted-friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "friends",
      "name email image"
    );
    const acceptedFriends = user.friends;
    res.json({ acceptedFriends });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//end point to post message and store in the backend
app.post("/messages", upload.single("imageFile"), async (req, res) => {
  try {
    const { senderId, recepientId, messageType, messageText } = req.body;

    const newMessage = new Message({
      senderId: senderId,
      recepientId: recepientId,
      messageType: messageType,
      message: messageText,
      timeStamp: new Date(),
      imageUrl: messageType === "image" ? `/files/${req.file.filename}` : null,
    });

    await newMessage.save();
    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//endpoint to get the user details to degin  the chat header

app.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    //fetch the user data from the user id
    const recipientData = await User.findById(userId);
    res.json(recipientData);
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//endpoin to fetch the messages two user in the chat room
app.get("/messages/:senderId/:recepientId", async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: senderId, recepientId: recepientId },
        { senderId: recepientId, recepientId: senderId },
      ],
    }).populate("senderId", "_id name");
    res.json(messages);
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//end point to deleted messages
app.post("/deleteMessages", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "invalid req body!!" });
    }
    await Message.deleteMany({ _id: { $in: messages } });
    res.json({ message: "deleted message successfully" });
  } catch (error) {
    console.log(err);
    res.status(500).json({ error: "internal error" });
  }
});

// Route handler for fetching sent friend requests
app.get("/friend-request/sent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate("sendFriendRequest", "name email image")
      .lean();
    const sentFriendRequests = user.sendFriendRequest;
    res.json(sentFriendRequests);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal error" });
  }
});
// Route handler for fetching user's friends
app.get("/friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    User.findById(userId)
      .populate("friends")
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        const friendIds = user.friends.map((friend) => friend._id);
        res.status(200).json(friendIds);
      });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal error" });
  }
});
