const express = require("express");
const router = express.Router();

const User = require("../models/user")
const Job = require("../models/job");


router.get('/user/:userId/jobs', async (req, res) => {
    try {
        const jobs = await Job.find({});
        res.json(jobs);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error fetching jobs');
    }
});

module.exports = router;