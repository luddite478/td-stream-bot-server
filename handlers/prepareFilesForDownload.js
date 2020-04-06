const { createDownloadTokenForTD, createMsgDir } = require('../utils')

module.exports = async (io, bot, message_id, file_id, requestMeta) => {
    try {
        const token = createDownloadTokenForTD(requestMeta.date, message_id)
        const msgPath = createMsgDir(message_id, token, requestMeta)
        await bot.downloadFile(file_id, msgPath)
        
        io.emit(`${requestMeta.type}_request`, { token, requestMeta})
        
    } catch(err) {
        console.log(err)
    }
}