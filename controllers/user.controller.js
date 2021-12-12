const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const workerModel = require('../models/user.model').user;

const addNewUser = async (req, res) => {
    const { passportId, firstName, lastName, password } = req.body, role = 'user';
    if (firstName.length < 3 || lastName.length < 3) {
        return res.status(400).json({ msg: 'Invalid input' })
    }
    const data = await workerModel.find({});
    const worker = data.find(worker => worker.passportId === passportId);
    if (worker) {
        return res.status(400).json({ msg: 'Worker is already exist' });
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new workerModel({
        passportId,
        firstName,
        lastName,
        password: hashedPassword,
        role
    });
    user.save((err, data) => {
        if (err) return res.status(404).send({ msg: err.errors.passportId.message });
        return res.status(200).send(data);
    });
}

const login = async (req, res) => {
    const { passportId, password } = req.body;
    const data = await workerModel.find({});
    const worker = data.find(worker => worker.passportId === passportId);
    if (!worker) {
        console.log('no worker');
        return res.status(400).json({ error: 'Worker does not exist' });
    }
    else {
        try {
            if (await bcrypt.compare(password, worker.password)) {
                const accessToken = jwt.sign({ id: worker._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
                console.log("accessToken", accessToken);
                worker.token = accessToken;
                worker.save((err, data) => {
                    if (err) return res.status(404).send(err);
                    return res.status(200).send({ token: accessToken, success: data });
                });
            }
            else {
                return res.status(400).json({ error: 'Password is invalid' });
            }
        }
        catch (err) {
            console.log('errrr', err);
            return res.status(400).json({ error: 'no authentication' });
        }
    }
}

const logout = async (req, res) => {
    console.log('logouttttt', req.user);
    try {
        const user = req.user
        user.token = '';
        await user.save()
        res.status(200).json(user)
    } catch (e) {
        res.status(400).send(e)
    }

}

const getToken = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(403).send({ result: 'error' });
    const data = await workerModel.find({});
    const worker = data.find(worker => worker.token === token);
    if (!worker) {
        return res.status(403).send({ msg: 'User not authentecated' });
    }
    else {
        return res.status(200).send({ msg: 'Use authentecated' });
    }
}

const getShifts = async (req, res) => {
    console.log(req.params);
    const id = req.params.id;
    console.log(id);
    const month = new Date().getMonth() + 1;
    workerModel.findById(id).populate('shifts', 'startDate enteryHour exitHour shiftDuration').exec((err, data) => {
        console.log("gettttshiftssssss");
        if (err) return res.status(400).json({ msg: err });
        if (!data) return res.status(400).json({ msg: 'worker does not exist!' });
        console.log("data get shifts:", data);
        const newShifts = [];
        if (data.shifts.length > 0) {
            data.shifts.map(shift => {
                if (month === shift.startDate.getMonth() + 1 && shift.exitHour) {
                    newShifts.push({
                        _id: shift.id,
                        enteryHour: shift.enteryHour,
                        exitHour: shift.exitHour,
                        shiftDuration: shift.shiftDuration,
                        month: shift.startDate.getMonth() + 1,
                        year: shift.startDate.getFullYear(),
                        day: shift.startDate.getDate()
                    })
                }
            })
        }
        else {
            console.log("nooooooo");
            return res.status(400).json({ msg: 'no shifts yet!' });
        }
        console.log(newShifts);
        return res.status(200).json(newShifts);
    });
}


module.exports = {
    addNewUser,
    login,
    logout,
    getToken,
    getShifts
}