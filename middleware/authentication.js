const jwt = require('jsonwebtoken');
const workerModel = require('../models/user.model').user;

async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log("token auth: ",token);
    if (token == null) return res.status(403).send({ result: 'error' });
    const data = await workerModel.find({});
    const worker = data.find(worker => worker.token === token);
    console.log("worker auth",worker);
    if (!worker) {
        return res.status(403).send({ msg: 'User not authentecated' });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, _) => {
        if (err) {
            worker.token = '';
            worker.save((err, _) => {
                if (err) return res.status(403).send(err);
            });
            return res.status(403).send({ result: 'error', msg: 'Expired token' });
        }
        req.user = worker;
        next();
    })
}

module.exports = authenticateToken;