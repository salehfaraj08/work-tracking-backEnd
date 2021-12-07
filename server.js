const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const port = 5001;

bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());

/***********************ROUTERS***************************/                        
app.use('/api/workers', require('./routes/user.route'));
app.use('/api/shifts', require('./routes/shift.route'));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.whijz.mongodb.net/workAppDb?retryWrites=true&w=majority`, { useNewUrlParser: true });
console.log(process.env.PORT);
app.listen(process.env.PORT || port, () => {
    console.log(`Server started on ${process.env.PORT || port}`);
});