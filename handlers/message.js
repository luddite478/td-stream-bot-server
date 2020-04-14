const handleVideoRequest  = require('./video')
const handleAudioRequest  = require('./audio')
const handlePhotoRequest  = require('./photo')
const handleTextRequest  = require('./text')
const handleVideoNoteRequest = require('./video_note.js')
const contentTypeParser = require('content-type-parser')

module.exports = (io, bot, msg) => {
    try {
        console.log('New request', msg)
        
        if (!isConenctedToTD) {
            bot.sendMessage(msg.chat.id, 'Receiver error')
            throw new Error('No socket connection')
        }

        const msgKeys = Object.keys(msg)
        if (msgKeys.some(key => key === 'audio')) {
            handleAudioRequest(io, bot, msg)
            return
        
        } else if (msgKeys.some(key => key === 'voice')) {
            msg.audio = msg.voice
            delete msg.voice
            handleAudioRequest(io, bot, msg)   
            return

        } else if (msgKeys.some(key => key === 'video')) {
            handleVideoRequest(io, bot, msg)   
            return

        } else if (msgKeys.some(key => key === 'photo')) {
            handlePhotoRequest(io, bot, msg)
            return

        } else if (msgKeys.some(key => key === 'video_note')) {
            handleVideoNoteRequest(io, bot, msg)
            return

        } else if (msgKeys.some(key => key === 'text')) {
            handleTextRequest(io, bot, msg)
            return
        
        } else if (msgKeys.some(key => key === 'animation')) {
            msg.video = msg.animation
            delete msg.animation
            delete msg.document
            handleVideoRequest(io, bot, msg)
            return     

        } else if (msgKeys.some(key => key === 'document' 
            && msg.document.hasOwnProperty('mime_type'))) {
                    
            const { mime_type } = msg.document
            const filetype = contentTypeParser(mime_type).type

            if (filetype === 'audio') {
                msg.audio = msg.document
                delete msg.document
                handleAudioRequest(io, bot, msg)
                return 

            } else if (filetype === 'video') {
                msg.video = msg.document
                delete msg.document
                handleVideoRequest(io, bot, msg)
                return 

            } else if (filetype === 'image') {
                msg.photo = msg.document
                delete msg.document
                handlePhotoRequest(io, bot, msg)
                return 

            } else {
                bot.sendMessage(msg.chat.id, `Can't handle your request, to get list of available actions use /info`)
                throw new Error('Can not guess file extension')
            }
            
        } else {
            bot.sendMessage(msg.chat.id, `Can't handle your request, to get list of available actions use /info`)
            throw new Error('Can not guess file extension')
        }

    } catch (err) {
        console.log(err)
    }
}