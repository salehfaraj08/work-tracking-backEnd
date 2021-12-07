const shiftModel = require('../models/shift.model').shift;

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

const startNewShift = async (req, res) => {
    console.log(new Date());
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
        const enteryHour = calculateShowHour(hours, minutes)
        const shift = new shiftModel({
            enteryHour
        });
        console.log("shifttttt:", shift.enteryHour);
        shift.save((err, data) => {
            if (err) return res.status(404).send(err);
            return res.status(200).send(data);
        });
    }

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
const endShift = async (req, res) => {
    let { _id, salaryPerHourPass } = req.body;
    if (_id) {
        console.log(_id);
        const shift = await shiftModel.findOne({ _id: _id });
        if (!shift) {
            return res.status(400).json({ error: 'these shift is not exist' });
        }
    }
    else {
        return res.status(400).json({ error: 'you havent start the shift today please contact the admin to update the hours' });
    }
    const shift = await shiftModel.findOne({ _id: _id });
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
        let salaryPerShift = 0, shiftDuration = '', dayLength;
        const exitHour = calculateShowHour(hours, minutes);
        if (minutesAndHours.hours >= 0 && minutesAndHours.hours < 9 && minutesAndHours.minutes > 0) {
            dayLength = 1;
        } else if (minutesAndHours.hours >= 9) {
            dayLength = 2;
        }
        if (minutesAndHours.hours > 0 && minutesAndHours.minutes > 0) {
            shiftDuration = `your shift duration is ${minutesAndHours.hours} hours and ${minutesAndHours.minutes} minutes`;
        }
        if (minutesAndHours.hours > 0 && minutesAndHours.minutes === 0) {
            shiftDuration = `your shift duration is ${minutesAndHours.hours} hours`;
        }
        if (minutesAndHours.hours === 0 && minutesAndHours.minutes > 0) {
            shiftDuration = `your shift duration is ${minutesAndHours.minutes} minutes`;
        }
        console.log("shift.salaryPerHour", shift.salaryPerHour);
        if (shift.salaryPerHour === 0) {
            if (dayLength === 2) {
                const additionHours = minutesAndHours.hours - 9;
                if (minutesAndHours.hours > 0) {
                    salaryPerShift += 9 * salaryPerHourPass;
                    salaryPerHourPass = salaryPerHourPass * (150 / 100);
                    salaryPerShift += additionHours * salaryPerHourPass;
                    if (!isInt(salaryPerShift))
                        salaryPerShift = salaryPerShift.toFixed(2)
                }
                if (minutesAndHours.minutes > 0) {
                    salaryPerShift += (minutesAndHours.minutes / 60) * salaryPerHourPass;
                    if (!isInt(salaryPerShift))
                        salaryPerShift = salaryPerShift.toFixed(2)
                }
                shiftModel.findByIdAndUpdate(_id, { endDate, dayLength, exitHour, salaryPerHour: salaryPerHourPass, salaryPerShift, shiftDuration }, { new: true }, (err, data) => {
                    if (err) return res.status(404).send(err);
                    return res.status(200).send(data);
                });
            }
            else {
                if (minutesAndHours.hours > 0) {
                    salaryPerShift += minutesAndHours.hours * salaryPerHourPass;
                    if (!isInt(salaryPerShift))
                        salaryPerShift = salaryPerShift.toFixed(2)
                }
                if (minutesAndHours.minutes > 0) {
                    salaryPerShift += (minutesAndHours.minutes / 60) * salaryPerHourPass;
                    if (!isInt(salaryPerShift))
                        salaryPerShift = salaryPerShift.toFixed(2)
                }
                shiftModel.findByIdAndUpdate(_id, { endDate, dayLength, exitHour, salaryPerHour: salaryPerHourPass, salaryPerShift, shiftDuration }, { new: true }, (err, data) => {
                    if (err) return res.status(404).send(err);
                    return res.status(200).send(data);
                });
            }
        }
        else {
            let newSalaryPerHour = shift.salaryPerHour;
            if (dayLength === 2) {
                const additionHours = minutesAndHours.hours - 9;
                if (minutesAndHours.hours > 0) {
                    salaryPerShift += 9 * newSalaryPerHour;
                    newSalaryPerHour = newSalaryPerHour * (150 / 100);
                    salaryPerShift += additionHours * newSalaryPerHour;
                    if (!isInt(salaryPerShift))
                        salaryPerShift = salaryPerShift.toFixed(2)
                }
                if (minutesAndHours.minutes > 0) {
                    salaryPerShift += (minutesAndHours.minutes / 60) * newSalaryPerHour;
                    if (!isInt(salaryPerShift))
                        salaryPerShift = salaryPerShift.toFixed(2)
                }
                shiftModel.findByIdAndUpdate(_id, { endDate, dayLength, exitHour, salaryPerShift, shiftDuration }, { new: true }, (err, data) => {
                    if (err) return res.status(404).send(err);
                    return res.status(200).send(data);
                });
            }
            else {
                if (minutesAndHours.hours > 0) {
                    salaryPerShift += minutesAndHours.hours * newSalaryPerHour;
                    if (!isInt(salaryPerShift))
                        salaryPerShift = salaryPerShift.toFixed(2)
                }
                if (minutesAndHours.minutes > 0) {
                    salaryPerShift += (minutesAndHours.minutes / 60) * newSalaryPerHour;
                    if (!isInt(salaryPerShift))
                        salaryPerShift = salaryPerShift.toFixed(2)
                }
                shiftModel.findByIdAndUpdate(_id, { endDate, dayLength, exitHour, salaryPerShift, shiftDuration }, { new: true }, (err, data) => {
                    if (err) return res.status(404).send(err);
                    return res.status(200).send(data);
                });
            }

        }


    }
}

module.exports = {
    startNewShift,
    endShift
}