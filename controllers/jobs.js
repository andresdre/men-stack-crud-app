const express = require("express");
const router = express.Router();

const User = require("../models/user")
const Job = require("../models/job");


router.get("/", async function (req, res) {
    try {
        const jobs = await Job.find({contractor: req.session.user._id});
        console.log(jobs);
        res.render("jobs/index.ejs", { jobs, user: req.session.user });
    } catch (err) {
        console.log(err);
        res.send("Error Rendering all jobs");
    }
});


router.get("/new", function (req, res) {
    res.render("jobs/new.ejs")
});


router.post('/create-job', async(req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).send("Unauthorized: Please log in.");
        }

        const contractorId = req.session.user._id;
        const { title, description } = req.body;

        const newJob = new Job({
            title,
            description,
            contractor: contractorId
        });

        await newJob.save();
        res.redirect('/jobs');
    } catch(err) {
        console.log(err);
        res.status(500).send('Error creating the job');
    }
});


router.post('/apply-job/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const { workerId } = req.body;

    try {
        const job = await Job.findById(jobId);
        if (!job || job.status !== 'open') {
            return res.status(404).json({ message: 'job not found or already assigned' });
        }

        job.workerAssigned = workerId;
        job.status = 'in-progress';
        await job.save();

        res.json({ message: 'job assigned to worker successfully', job});
    } catch(error) {
        res.status(500).json({ message: 'Server error', error});
    }
});


router.put('/:jobId', async function(req, res) {
    try {
        const currentUser = await User.findById(req.session.user._id)
        const job = currentUser.jobs.id(req.params.jobId)

        job.set(req.body)

        await currentUser.save()

        res.redirect(`/users/${currentUser._id}/jobs/${job._id}`);

    } catch(err) {
        console.log(err)
        res.send("Error updating application, check terminal")
    }
})

router. get('/:jobId/edit', async function(req, res) {
    try{
        const job = await Job.findById(req.params.jobId);
        res.render('jobs/edit.ejs', { job: job });
    } catch(err) {
        console.log(err)
        res.send('Error getting edit form')
    }
});


router.put('/:jobId', async function(req, res){
    console.log(req.body);
    const job = await Job.findByIdAndUpdate(req.params.jobId, req.body, { new: true });
    console.log(job);
    res.redirect(`/jobs/${req.params.jobId}`);
});


router.post('/rate-worker/:workerId', async (req, res) => {
    try {
      const { rating } = req.body;
      const { workerId } = req.params;
      const contractorId = req.user._id;

      if (!rating) {
        return res.status(400).send('Rating is required');
      }

      const worker = await User.findById(workerId);
      if (!worker) {
        return res.status(404).send('Worker not found');
      }
  
      worker.rating.push(rating);
      await worker.save();
      worker.calculateAverageRating();

      const job = await Job.findOne({ workerAssigned: workerId, contractor: contractorId });
      if (job) {
        job.rating = rating;
        await job.save();
      }
  
      res.redirect('/jobs');
    } catch (err) {
      console.log(err);
      res.status(500).send('Error rating worker');
    }
  });


router.delete('/:jobId', async function(req, res) {
    try {
    const currentUser = await User.findById(req.session.user._id);
    currentUser.jobs.id(req.params.jobId).deleteOne();
    await currentUser.save();

    res.redirect(`/users/${currentUser._id}$/jobs`)
} catch(err) {
        console.log(err)
        res.send('Error deleting application')
    }
});


router.get('/:jobId', async function(req, res) {
    console.log(req.session)
//    if (req.session.user.role === 'contractor') {
        try {
            const job = await Job.findById(req.params.jobId);
            console.log(job);
            res.render('jobs/show.ejs', {job: job});
        } catch(err) {
            console.log(err)
            res.send('Error and show page')
        }
  //  } else {
    //     try {
    //         res.render('jobs/show.ejs');
    //     } catch(err) {
    //         console.log(err)
    //         res.send('Error and show page')
    //     }
    // }
    
});


// router.post("/", async function (req, res) {
//     try {
//         const currentUser = await User.findById(req.session.user._id);
//         currentUser.jobs.push(req.body);

//         await currentUser.save();
//         console.log(currentUser, "<- currentUser");

//         res.redirect(`/users/${currentUser._id}$/jobs`);
//     } catch(err) {
//         console.log(err);
//         res.send("Error check the terminal for debug");
//     }
// });

module.exports = router;
