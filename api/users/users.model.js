const { Schema, model } = require('mongoose');

const UserSchema = new Schema ({
    email: String,
    password: String,
    avatarURL: String,
    status: {
        type: String,
        requred: true,
        enum: ['created', 'verified'],
        default: 'created',
      },
    verificationToken: { type: String, default: '' },
    subscription: {
        type: String,
        enum: ["free", "pro", "premium"],   
        default: "free"
    },
    token: String                                               
})

module.exports= model("User", UserSchema);
