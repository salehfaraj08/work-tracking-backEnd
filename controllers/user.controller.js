const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const workerModel = require('../models/user.model').user;

const addNewUser = async (req, res) => {
    const { passportId, firstName, lastName, password } = req.body, role = 'user';
    console.log(passportId, firstName, lastName, password);
    if (firstName.length < 3 || lastName.length < 3) {
        return res.status(400).json({ error: 'Invalid input' })
    }
    const data = await workerModel.find({});
    const worker = data.find(worker => worker.passportId === passportId);
    console.log(worker);
    if (worker) {
        return res.status(400).json({ error: 'Worker is already exist' });
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
        if (err) return res.status(404).send(err.errors.passportId.message);
        return res.status(200).send(data);
    });
}

const login = async (req, res) => {
    const { passportId, password } = req.body;
    console.log(passportId, password);

    const data = await workerModel.find({});
    const worker = data.find(worker => worker.passportId === passportId);
    console.log(worker);
    if (!worker) {
        console.log('no worker');
        return res.status(400).json({ error: 'Worker does not exist' });
    }
    else {
        try {
            if (await bcrypt.compare(password, worker.password)) {
                const accessToken = jwt.sign({ id: worker._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1000s' });
                console.log("accessToken",accessToken);
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

const addNewShift = async (req, res) => {
    const { workerId, shiftId } = req.body;
    console.log(workerId, shiftId);
    workerModel.findByIdAndUpdate(workerId, { shifts: shiftId }, { new: true }, (err, data) => {
        if (err) return res.status(404).send(err);
        return res.status(200).send(data);
    });
}


const getToken = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(403).send({ result: 'error' });
    const data = await workerModel.find({});
    const worker = data.find(worker => worker.token === token);
    console.log("worker",worker);
    if (!worker) {
        return res.status(403).send({ msg: 'User not authentecated' });
    }
    else{
        return res.status(200).send({ msg: 'Use authentecated' });
    }
}

module.exports = {
    addNewUser,
    login,
    logout,
    addNewShift,
    getToken
}