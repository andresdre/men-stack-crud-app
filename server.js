const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require("express-session");
const bodyParser = require("body-parser");


const authController = require("./controllers/auth.js");
const jobCtrl = require("./controllers/jobs.js");
const userController = require("./controllers/users.js");


const isSignedIn = require("./middleware/is-signed-in.js");
const pasUserToView = require("./middleware/pass-user-to-view.js");

const port = process.env.PORT ? process.env.PORT : "3000";

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
    console.log(`Connected to mongoDB ${mongoose.connection.name}`)
})


app.use(express.urlencoded({ extended: false}));
app.use(methodOverride("_method"));
app.use(morgan("dev"));


// new code below this line ---
app.use(express.static(path.join(__dirname, 'public')));
// new code above this line --

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
)


app.use(pasUserToView);

app.get("/", (req, res) => {
    console.log(req.session, "<- req.session");

    if (req.session.user) {
        console.log(req.session);
        res.redirect(`/users/${req.session.user._id}/jobs`);
    } else {
        res.render("index.ejs");
    }
})


app.use("/auth", authController);
app.use("/users", userController);
app.use(isSignedIn)
app.use("/jobs", jobCtrl);


app.listen(port, () => {
    console.log(`The express app is ready on port ${port}$`)
});
