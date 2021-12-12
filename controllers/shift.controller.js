const shiftModel = require('../models/shift.model').shift;
const workerModel = require('../models/user.model').user;
const calculateShowHour = (hours, minutes) => {
    if (hours < 10 && hours >= 0) {
        hours = '0' + hours;
        console.log('new hours is:', hours);
    }
    else {
        hours = hours + '';
    }
    if (minutes < 10 && minutes >= 0) {
        minutes = '0' + minutes;
        console.log('new minutes is:', minutes);
    }
    else {
        minutes = minutes + '';
    }
    return hours + ':' + minutes;
}

const calculateDurationShift = (now, date) => {
    let diffInMilliSeconds = Math.abs(now - date) / 1000;
    const days = Math.floor(diffInMilliSeconds / 86400);
    diffInMilliSeconds -= days * 86400;

    // calculate hours
    const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;
    console.log('calculated hours', hours);

    // calculate minutes
    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;
    console.log('minutes', minutes);
    return { hours, minutes };
}

function isInt(n) {
    return n % 1 === 0;
}

const createShift = (res, day, hours, minutes, id) => {
    if (day === 7) {
        return res.status(400).json({ msg: 'today is a day off' });
    }
    else {
        const enteryHour = calculateShowHour(hours, minutes)
        const shift = new shiftModel({
            startDate: new Date(),
            enteryHour
        });
        console.log("shifttttt:", shift.enteryHour);
        shift.save((err, shiftData) => {
            if (err) return res.status(404).send(err);
            workerModel.findByIdAndUpdate(id, { shifts: shiftData._id }, { new: true }, (err, _) => {
                if (err) return res.status(404).send(err);
                return res.status(200).send(shiftData);
            });
        });
    }
}

/*** controller fucnctions ***/

const startNewShift = async (req, res) => {
    const { id } = req.body;
    console.log("id from new shift:", id);
    const worker = await workerModel.findById(id).populate('shifts', 'startDate endDate').exec();
    console.log("worker from new shift:", worker);
    const shifts = worker.shifts;
    const day = new Date().getDate();
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const hours = new Date().getHours();
    console.log('the hours is:', hours);
    const minutes = new Date().getMinutes();
    console.log('the minutes is:', minutes);
    if (shifts.length > 0) {
        const findShift = shifts.find(shift => {
            if (shift.startDate.getDate() === day && shift.startDate.getMonth() + 1 === month && shift.startDate.getFullYear() === year && shift.endDate) {
                return true;
            }
            return false;
        });
        if (findShift) {
            return res.status(400).json({ msg: 'you have started your shift already today' });
        }
        else {
            createShift(res, day, hours, minutes, id);
        }

    }
    else {
        createShift(res, day, hours, minutes, id);
    }
}


const endShift = async (req, res) => {
    let { id } = req.body;
    console.log(id);

    if (id) {
        console.log(id);
        const shift = await shiftModel.findOne({ _id: id });
        if (!shift) {
            return res.status(400).json({ error: 'these shift is not exist' });
        }
    }
    else {
        return res.status(400).json({ error: 'you havent start the shift today please contact the admin to update the hours' });
    }
    const shift = await shiftModel.findOne({ _id: id });
    console.log(shift.startDate, new Date());
    const endDate = new Date();
    const minutesAndHours = calculateDurationShift(endDate, shift.startDate);
    console.log(minutesAndHours);
    const hours = new Date().getHours();
    console.log('the hours is:', hours);
    const minutes = new Date().getMinutes();
    console.log('the minutes is:', minutes);
    const day = new Date().getDay() + 1;
    console.log('the day is:', day);
    if (day === 7) {
        return res.status(400).json({ error: 'today is a day off' });
    }
    else {
        let dayLength;
        const exitHour = calculateShowHour(hours, minutes);
        if (minutesAndHours.hours >= 0 && minutesAndHours.hours < 9 && minutesAndHours.minutes > 0) {
            dayLength = 1;
        } else if (minutesAndHours.hours >= 9) {
            dayLength = 2;
        }
        if (minutesAndHours.hours > 0 && minutesAndHours.minutes > 0) {
            shiftDuration = `${minutesAndHours.hours} hours and ${minutesAndHours.minutes} minutes`;
        }
        if (minutesAndHours.hours > 0 && minutesAndHours.minutes === 0) {
            shiftDuration = `${minutesAndHours.hours} hours`;
        }
        if (minutesAndHours.hours === 0 && minutesAndHours.minutes > 0) {
            shiftDuration = `${minutesAndHours.minutes} minutes`;
        }
        shiftModel.findByIdAndUpdate(id, { endDate, dayLength, exitHour, shiftDuration }, { new: true }, (err, data) => {
            if (err) return res.status(404).send(err);
            return res.status(200).send(data);
        });
    }
}

module.exports = {
    startNewShift,
    endShift
}