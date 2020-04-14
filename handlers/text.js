const { isUserAllowed, choosePhotoWithMaxResolution } = require('../utils')
const validUrl = require('valid-url')

const FILE_TYPE = 'text'

const infoMsg = (channelLink) => `
This is a media request bot for live [channel](${channelLink}) stream.

Available actions:

*1. Video, audio, image, voice message request*

To make a request drop a file into the chat.
New request will play forever until the next one.
Maximum file size is 20mb.

*2. Youtube restream request*

type \`/restream youtube_stream_link\`
To stop restream type \`restream stop\` or drop some media file to show instead of your stream.
`

function handleRestreamCmd (io, bot, msg) {
    const { text } = msg
    const splittedMsg = text.split(' ')

    if (splittedMsg.length !== 2) {
        bot.sendMessage(msg.chat.id, `Can't handle your request. 
        Command: /restream <youtube_link>, for example: /restream https://www.youtube.com/watch?v=fHd4tdYJYVw`)
        return
    } 

    const secondWord = splittedMsg[1]

    if (secondWord === 'stop') {
        console.log('Got stop restream command')
        bot.sendMessage(msg.chat.id, `Going to stop restreaming`)
        io.emit('restream_stop_request', true)
        return
    }

    const stream_link = secondWord

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

function handleUrlRequest (io, bot, msg) {
    const { text } = msg
    const splittedMsg = text.split(' ')

    if (splittedMsg.length !== 2) {
        bot.sendMessage(msg.chat.id, `Can't handle your request. 
        Command: /url_request <youtube_link>, for example: /url_request https://youtu.be/zavUL7QLRJo`)
        return
    } 

    const secondWord = splittedMsg[1]

    if (secondWord === 'stop') {
        console.log('Got stop url_request command')
        bot.sendMessage(msg.chat.id, `Going to stop restreaming`)
        io.emit('url_stop_request', true)
        return
    }

    const stream_link = secondWord

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

    console.log('Valid url request request, emitting event. Link: ', stream_link)
    io.emit('url_request', stream_link)
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
            bot.sendMessage(msg.chat.id, infoMsg(process.env.YT_CHANNEL_LINK), {parse_mode: "Markdown"})

        } else if (splittedMsg[0].match(/\/url_request/)) {
            handleUrlRequest(io, bot, msg)

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