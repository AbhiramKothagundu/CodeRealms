const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

//const userSchema = new mongoose.Schema({
//    username: { type: String, unique: true, required: true },
//    password: { type: String, required: true },
//    email: { type: String, unique: true, required: true }
//});

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
       
    },
    phoneNumber: {
        type: String,
        
    },
    instagramLink: {
        type: String,
        
    },
    linkedinLink: {
        type: String,
      
    },
    twitterLink: {
        type: String,
       
    },
    name: {
        type: String,
       
    },
    type: {
        type: String,
       
    },
    college: {
        type: String,
       
    },
    aboutme: {
        bio: {
            type: String,
           
        },
        experience: [{
            type: String,
           
        }],
        education: [{
            type: String,
           
        }]
    },
    skills: [{
        title: {
            type: String,
           
        },
        description: {
            type: String,
           
        }
    }],
    realmIds: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'Realm'
        }
    ],
    arrproblem: [{
        problemId: {
            type: mongoose.Schema.Types.ObjectId,ref: 'Problem'
        },
        points: {
            type: Number,
            default: 0
        }
    }],
    arrcontest: [{
        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contest'
        },
        points: {
            type: Number,
            default: 0
        }
    }]
});


UserSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        next();
    } catch (error) {
        return next(error);
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
