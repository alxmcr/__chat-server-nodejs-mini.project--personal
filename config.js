module.exports = {
    db: process.env.MONGODB_URI || 'mongodb://test:test123@ds041178.mlab.com:41178/chat-001',
    SECRET_TOKEN: 'MY_KEY_SECRET'
}