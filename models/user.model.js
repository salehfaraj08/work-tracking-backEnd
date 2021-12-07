const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    passportId: {
        type: String,
        required: true,
        minlength: [9, 'passport id should be 9 digits'],
        maxlength: [9, 'passport id should be 9 digits']
    },
    firstName: {
        type: String,
        required: true,
        minlength: 3
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        required: true,
    },
    shifts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "shifts",
        required: false,
    }],
    token: { type: String, required: false }
});

const user = mongoose.model('users', userSchema);

module.exports = {
    user
}