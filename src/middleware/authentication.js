const User = require('../models/user');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //find the user tiwht he correct id who has that authentification numbe still stored
        const user = await User.findOne({
            _id: decoded._id,
            'tokens.token': token,
        });

        if (!user) {
            throw new Error();
        };

        //we add a rpoperty onto the request to store the user
        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({
            error: 'please authenticate'
        });
    }
}



// app.use((req, res, next) => {
//     if (req.method === "GET") {
//         res.send('GET requests are disabled')
//     } else {
//         console.log(req.method, req.path);
//         next();
//     }
// });

// app.use((req,res,next)=>{
//     res.status(503).send('the website is under maintanance, please try again soon.')
// });

module.exports = auth