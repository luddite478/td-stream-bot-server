require('dotenv').config()
const express = require('express')
const TelegramBot = require('node-telegram-bot-api')
const app = express()
const path = require('path')
const fs = require('fs')

const is_https = process.env.IS_HTTPS

let server
if (is_https === 'YES') {
    server = require('https').createServer({
        key: fs.readFileSync('~/.ssh/stream_server.key'),
        cert: fs.readFileSync('~/.ssh/stream_server.crt'),
        ca: fs.readFileSync('~/.ssh/rootCA.pem'),
        requestCert: false,
        rejectUnauthorized: false
    }, app)
} else {
    server = require('http').createServer(app)
}
 
const io = require('socket.io')(server)
require('./stream_notificator')(io)


const PORT = 8787

const handleMessage = require('./handlers/message')
const handleDownloadRequest = require('./handlers/handleDownloadRequest')
global.serverAddress = `${process.env.AWS_SERVER_ADDRESS}`

global.msgsDir = path.join(__dirname, 'messages')
global.isConenctedToTD = false

// Socket.io connection with TD
io.on('connection', (socket) => {
    isConenctedToTD = true
    console.log('TD connected')

    socket.on('disconnect', () => {
        isConenctedToTD = false
        console.log('TD disconnected')
    })
})

// TG Bot 
const tg_token = process.env.TG_TOKEN

const bot = new TelegramBot(tg_token, { polling: true })

// bot.on('audio', (msg) => handleAudioRequest(io, bot, msg))

// bot.on('voice', (msg) => handleAudioRequest(io, bot, msg))

// bot.on('video', (msg) => handleVideoRequest(io, bot, msg))

// bot.on('photo', (msg) => handlePhotoRequest(io, bot, msg))

bot.on('message', (msg) => handleMessage(io, bot, msg))

bot.on('text', (msg) => console.log('text'))
bot.on('audio', (msg) => console.log('audio'))
bot.on('document', (msg) => console.log('document'))
bot.on('photo', (msg) => console.log('photo'))
bot.on('sticker', (msg) => console.log('sticker'))
bot.on('video', (msg) => console.log('video'))
bot.on('voice', (msg) => console.log('voice', msg))
bot.on('contact', (msg) => console.log('contact'))
bot.on('location', (msg) => console.log('location'))
bot.on('game', (msg) => console.log('game'))
bot.on('video_note', (msg) => console.log('video_note',msg))
bot.on('invoice', (msg) => console.log('invoice'))


bot.on('error', (err) => console.log(err))

bot.on('polling_error', (error) => {
    console.log('Telegram polling error: ', error.code)
})

// http server
app.get('/download', handleDownloadRequest)

server.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
})
