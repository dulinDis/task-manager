const mongoose = require('mongoose');
const Task = require('../models/task');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//second oprion is a  scheme object
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        //default: "Anonymous",
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('invalid email address')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        //es6 way of writing now:
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number.')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.length < 6) {
                throw new Error('the password you provided is too short.')
            } else if (value.toLowerCase().includes('password')) {
                throw new Error('use another password... some imagination plz')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

//virtual property setup - first parameter is whatever we want, then second is object with individual fields, this property is virual and is not sotred inthe databaas,e its just for mongoose to know the relation
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner',
});

//for an individual instance of a user 
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({
        //this is an object id so we use tostring to convert to normal string
        _id: user._id.toString()
    }, process.env.JWT_SECRET , {
        expiresIn: '7 days',
    });
    user.tokens = user.tokens.concat({
        token
    });

    await user.save();
    return token;
};

//to send public data
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    //this returns raw daya 
    delete userObject.password;
    delete userObject.tokens;

    return userObject;

}

//for all the model
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({
        email
    });
    if (!user) {
        throw new Error('unable to login');
    };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('unable to login');
    };

    return user;
};

//Hash the plain text pass before saving 
userSchema.pre('save', async function (next) {
    //this<doocument whisc is beig saved
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    // console.log('just before saving');
    next();
});
//delete user tasks when user is removed

userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({
        owner: user._id
    });
    next();
})



const User = mongoose.model('User', userSchema);

module.exports = User;