const { isUserAllowed, choosePhotoWithMaxResolution } = require('../utils')
const prepareFilesForDownload  = require('./prepareFilesForDownload')

const FILE_TYPE = 'photo'
const MAX_FILE_SIZE_BYTES = 20000000 

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

        const { message_id, date } = msg
        const { username } = msg.from

        const photo = choosePhotoWithMaxResolution(msg.photo)

        const { file_id, file_size, width, height } = photo
        
        if (file_size > MAX_FILE_SIZE_BYTES) {
            bot.sendMessage(msg.chat.id, `Maximum file size - ${MAX_FILE_SIZE_BYTES/1000000} mb`)
        }
 
        if (!isUserAllowed(username)) {
            bot.sendMessage(msg.chat.id, 'You are not allowed to make requests')
            throw new Error(`User ${username} is not allowed`)
        }

        const requestMeta = {
            type: FILE_TYPE,
            username,
            date: Date.now(),
            message_id,
            file: {
                extension: 'jpeg',
                width,
                height,
                file_size
            }
        }
 
        prepareFilesForDownload(io, bot, message_id, file_id, requestMeta)

    } catch (err) {
        console.log(err)
    }
}