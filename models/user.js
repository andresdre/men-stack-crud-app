const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true},
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['contractor', 'worker'], required: true },
    rating: { type: Number, default: 0 },
    ratings: { type: [Number], default: [] }
});


userSchema.methods.calculateAverageRating = function () {
    if (this.ratings.length > 0) {
        this.rating = this.ratings.reduce((sum, rating) => sum + rating, 0) / this.ratings.length;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
