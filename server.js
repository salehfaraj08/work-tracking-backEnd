const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const mongoose = require('mongoose');
const port = 5001;

/***********************ROUTERS***************************/                        
app.use('/api/workers', require('./routes/user.route'));
app.use('/api/shifts', require('./routes/shift.route'));

// mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.whijz.mongodb.net/workAppDb?retryWrites=true&w=majority`, { useNewUrlParser: true });
mongoose.connect(`mongodb+srv://saleh:saleh0811@cluster0.whijz.mongodb.net/workAppDb?retryWrites=true&w=majority`, { useNewUrlParser: true });
app.listen(process.env.PORT || port, () => {
    console.log(`Server started on ${process.env.PORT || port}`);
});