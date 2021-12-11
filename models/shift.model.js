const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        default: new Date(),
        required: true,
    },
    endDate:{
        type: Date
    },
    dayLength: {
        type: Number,
        min: [0],//3 options for day length 0 is day off 1 is under 9 hours that is a full time job and 2 is a 9 hours and above
        max: [2]
    },
    enteryHour: {
        type: String
    },
    exitHour: {
        type: String
    },
    shiftDuration: {
        type: String
    }

});

const shift = mongoose.model('shifts', shiftSchema);

module.exports = {
    shift
}
