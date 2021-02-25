// jshint esversion:6;

const app = require('./app');
const port = process.env.PORT;

app.listen(port, () => {
    console.log('server working on port: ' + port);
});