const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    contractor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workerAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' },
    rating: { type: Number, default: 0 },
    company: { type: String, required: true}
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
