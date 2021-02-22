// jshint esversion:6;
const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT ;

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log('server working on port: ' + port);
    //console.log(`%c server working on port: ${port}`,"font-weight:bold; color:green");
});