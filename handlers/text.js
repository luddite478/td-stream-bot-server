const { isUserAllowed, choosePhotoWithMaxResolution } = require('../utils')
const validUrl = require('valid-url')

const FILE_TYPE = 'text'

const infoMsg = (channelLink) => `
This is a media request bot for live stream channel ${channelLink}.

You are able to request audio, video, image files and send voice messages.

To make a request drop a file into the chat.

New request will play forever until the next one.

Maximum file size is 20mb.
`

function handleRestreamCmd (io, bot, msg) {
    const { text } = msg
    const splittedMsg = text.split(' ')

    if (splittedMsg.length !== 2) {
        bot.sendMessage(msg.chat.id, `Can't handle your request. 
        Command: /restream <youtube_link>, for example: /restream https://www.youtube.com/watch?v=fHd4tdYJYVw`)
        return
    } 

    const stream_link = splittedMsg[1]

    if (!validUrl.isUri(stream_link)) {
        bot.sendMessage(msg.chat.id, `Url is not vavlid`)
        return
    }

    const { hostname } = new URL(stream_link)
    const supportedStreamPlatforms = [
        'www.youtube.com',
        'www.youtu.be',
        'youtube.com',
        'youtu.be'
    ]

    if (!supportedStreamPlatforms.some((platform) => platform === hostname)) {
        bot.sendMessage(msg.chat.id, `${hostname} is not supported`)
        return 
    }

    console.log('Valid restream request, emitting event. Link: ', stream_link)
    io.emit('restream_request', stream_link)
}

module.exports = (io, bot, msg) => {
    try {
        console.log(`New ${FILE_TYPE} request`, msg)
        
        if (!isConenctedToTD) {
            bot.sendMessage(msg.chat.id, 'Receiver error')
            throw new Error('No socket connection')
        }

        if (!Object.keys(msg).some(key => key === FILE_TYPE)) {
            bot.sendMessage(msg.chat.id, 'Receiver error')
            throw new Error(`${FILE_TYPE} handler used but no ${FILE_TYPE} key in the message!`)
        }

        const { username } = msg.from
        const { text } = msg
  
        if (!isUserAllowed(username)) {
            bot.sendMessage(msg.chat.id, 'You are not allowed to use this bot')
            throw new Error(`User ${username} is not allowed`)
        }

        const splittedMsg = text.split(' ')

        if (splittedMsg[0].match(/\/info/)) {
            bot.sendMessage(msg.chat.id, infoMsg(process.env.YT_CHANNEL_LINK))

        } else if (splittedMsg[0].match(/\/restream/)) {
            handleRestreamCmd(io, bot, msg)
        } else {
            bot.sendMessage(msg.chat.id, `Can't handle your request, to get list of available actions use /info`)
        }

    } catch (err) {
        console.log(err)
        bot.sendMessage(msg.chat.id, `Can't handle your request, to get list of available actions use /info`)
    }
}