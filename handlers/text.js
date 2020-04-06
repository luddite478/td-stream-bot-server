const { isUserAllowed, choosePhotoWithMaxResolution } = require('../utils')

const FILE_TYPE = 'text'
const infoMsg = (channelLink) => `
This is a media request bot for live stream channel ${channelLink}.

You are able to request audio, video, image files and send voice messages.

To make a request drop a file into the chat.

New request will play forever until the next one.

Maximum file size is 20mb.
`

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

        if (text.match(/\/info/)) {
            bot.sendMessage(msg.chat.id, infoMsg(process.env.YT_CHANNEL_LINK))
        } else {
            bot.sendMessage(msg.chat.id, `Can't handle your request, to get list of available actions use /info`)
        }

    } catch (err) {
        console.log(err)
    }
}