// Mongoose
const mongoose = require('mongoose');
// ObjectId
const ObjectId = mongoose.Types.ObjectId;

// Model: Message
const Message = require('./Message');

// MONGO DB
// Configuration
const config = require('../config');
// console.log(config.db);

mongoose.connect(config.db, {
    useNewUrlParser: true
});

// Checking connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log("MLAB.com --> we're connected!");
});


function saveMessageService(messageJSON) {
    return Message.create(messageJSON)
        .then(data => {
            // console.log('saveMessageService -> data', data);
            return data;
        }).catch(err => {
            console.log('saveMessageService -> err', err);
            return err;
        });
}

function getMessagesService(nameRoom) {
   return Message.find({
            room: nameRoom
        })
        .then(data => {
            // console.log('getMessagesService -> data', data);
            return data;
        }).catch(err => {
            console.log('getMessagesService -> err', err);
            return err;
        });
}

module.exports = {
    saveMessageService,
    getMessagesService
}
