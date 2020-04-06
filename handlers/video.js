const { isUserAllowed, chooseExtByMimeType } = require('../utils')
const prepareFilesForDownload  = require('./prepareFilesForDownload')

const FILE_TYPE = 'video'
const MAX_FILE_SIZE_BYTES = 20000000

module.exports = (io, bot, msg) => {
    try {
        console.log('New video request', msg)

        if (!Object.keys(msg).some(key => key === FILE_TYPE)) {
            throw new Error(`${FILE_TYPE} handler used but no ${FILE_TYPE} key in the message!`)
        }

        if (!isConenctedToTD) {
            bot.sendMessage(msg.chat.id, 'Receiver error')
            throw new Error('No socket connection')
        }

        const { video, message_id, date, chat } = msg
        const { username } = msg.from
        const { file_id, duration, mime_type, width, height, file_size } = video

        if (file_size > MAX_FILE_SIZE_BYTES) {
            bot.sendMessage(msg.chat.id, `Maximum file size - ${MAX_FILE_SIZE_BYTES/1000000} mb`)
        }

        if (!isUserAllowed(username)) {
            bot.sendMessage(msg.chat.id, 'You are not allowed to make requests')
            throw new Error(`User ${username} is not allowed`)
        }

        const extension = chooseExtByMimeType(FILE_TYPE, mime_type)

        if (!extension) {
            bot.sendMessage(msg.chat.id, `extension is not supported`)
            throw new Error(`${FILE_TYPE} file extension is not supported`)
        }

        const requestMeta = {
            type: FILE_TYPE,
            username,
            date: Date.now(),
            message_id,
            file: {
                file_size,
                width,
                height,
                extension,
                duration
            }
        }

        prepareFilesForDownload(io, bot, message_id, file_id, requestMeta)

    } catch (err) {
        console.log(err)
    }
}