const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Message Schema
const MessageSchema = new Schema({
    room: {
        type: String
    },
    username: {
        type: String,
        required: [true, 'Name field is required']
    },
    text: {
        type: String
    }
});

const Message = mongoose.model('message', MessageSchema);

module.exports = Message;