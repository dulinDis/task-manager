const express = require('express');
const multer = require('multer');
const User = require('../models/user');
const router = new express.Router();
const auth = require('../middleware/authentication');
const {
    sendWelcomeEmail,
    sendGoodByeEmail
} = require('../emails/account');


router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    try {
        const user = await User.findByCredentials(userEmail, userPassword);
        const token = await user.generateAuthToken();
        res.send({
            user,
            token
        });

    } catch (e) {
        res.status(400).send();
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            //token.token is an object with property toen, if true then stays in the array if not then out
            return token.token !== req.token;
        });
        await req.user.save();
        res.status(200).send();
    } catch (e) {
        res.status(500).send(e);
    }
});

//logout from all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'email', 'password'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({
            error: 'invalid updates'
        })
    };
    if (req.user._id.length < 24) {
        return res.status(404).send();
    };

    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save();
        res.send(req.user);

    } catch (e) {
        if (e.name === "ValidationError") {
            return res.status(400).send(e);
        } else {
            return res.status(500).send(e);
        }
        //res.status(400).send(e);
        //res.status(500).send(e);
    };

});

//to remove yourself
router.delete('/users/me', auth, async (req, res) => {
    // because we attached the user onto the request by auth!!!
    // if (req.user._id.length < 24) {
    //     return res.status(404).send({
    //         error: 'incorrect id number length'
    //     })
    // };

    try {
        await req.user.remove();
        sendGoodByeEmail(req.user.email, req.user.name);
        res.status(200).send(req.user)

    } catch (e) {
        return res.status(500).send(e)
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)/)) {
            return cb(new Error('Please upload an image.'))
        }
        cb(undefined, true);
    }
});

//form data request require separate routers, since does not send json
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.status(200).send();
}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined,
        await req.user.save();
    res.status(200).send(
        'profile picture sucessfully deleted'
    )
}, (error, req, res, next) => {
    res.status(400).send({
        error: 'unable to remove the picture'
    })
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error('unable to fetch the profile picture')
        }

        //res.set('Content-Type','application/json')
        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar);

    } catch (e) {
        res.status(404).send()
    }
}, (error, req, res, next) => {
    res.send({
        error: error.message
    })
})




module.exports = router;