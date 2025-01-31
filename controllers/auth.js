const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const session = require('express-session');

router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs');
});

router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs');
});

router.get('/sign-out', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});


router.post('/sign-up', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
        return res.send('Username already taken.');
    }
  
    if (req.body.password !== req.body.confirmPassword) {
        return res.send('Password and Confirm Password must match');
    }
  
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashedPassword;
  
    const userCreated = await User.create(req.body);
    
    req.session.user = {
      username: userCreated.username,
      _id: userCreated._id,
      role: userCreated.role
    }

    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.redirect('/auth/sign-in');
  }
});


router.post('/sign-in', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (!userInDatabase) {
        console.log("User not found");
      return res.send('Login failed. Please try again.');
    }

    console.log("User found:", userInDatabase);
  
    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    );
    if (!validPassword) {
        console.log("Invalid Password");
      return res.send('Login failed. Please try again.');
    }

    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
      role: userInDatabase.role
    };

    console.log("User logged in:", req.session.user);
  
    res.redirect('/jobs');
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

module.exports = router;
