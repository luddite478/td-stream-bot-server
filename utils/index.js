const mime = require('mime')
const fs = require('fs')
const path = require('path')

function isUserAllowed (username) {
    const allowedUsersRaw = fs.readFileSync('allowed_users.json')
    const allowedUsers = JSON.parse(allowedUsersRaw).users
    return allowedUsers.some(user => user === username)
}

function createMsgDir (message_id, token, requestMeta) {
    try {
        const { username, date } = requestMeta

        if (!username || !date || !message_id || !token) {
            throw new Error('Some path params are not specified')
        }

        const msgPath = path.join(msgsDir, `${username}_${message_id}_${date}_${token}`)
    
        if (!fs.existsSync(msgPath)) {
            fs.mkdirSync(msgPath)
            return msgPath
        } else {
            throw new Error('Folder already exists')
        }

    } catch (error) {
        console.log('Failed to create folder for message ', error)
        return null
    }
}

function createDownloadTokenForTD (messageId, messageDate) {
    const td_download_key = process.env.TD_DOWNLOAD_KEY
    return  messageDate + messageId ^ td_download_key // simple symmetric XOR
}

function choosePhotoWithMaxResolution (photoArr) {
    let maxWidth = 0
    let maxResIndex = 0

    photoArr.forEach((ph, i) => {
        if (ph.width > maxWidth) {
            maxWidth = ph.width
            maxResIndex = i 
        }           
    })

    return photoArr[maxResIndex]
}

function chooseExtByMimeType (type, mime_type) {

    const TD_SUPPORTED_VIDEO_EXTENSIONS = [
        'avi', 'flv', 'm2ts', 'm4v', 'mkv', 'mov', 'mp4', 'mpeg', 'mpg', 'wmv', '3gp', 'mxf', 'ts', 'r3d'
    ]

    const TD_SUPPORTED_AUDIO_EXTENSIONS = [
        'aif', 'aiff', 'wav', 'mp3', 'flac', 'ogg', 'm4a', 'avi', 'flv', 'm2ts', 'm4v', 'mkv', 'mov', 'mp4', 'mpeg', 'mpg', 'mts', 'wmv', '3gp', 'mxf', 'ts', 'r3d'
    ]

    // const TD_SUPPORTED_IMAGE_EXTENSIONS = [
    //     'tif', 'tiff', 'bmp', 'gif', 'hdr', 'jpeg', 'jpg', 'pic', 'png', 'swf', 'tga', 'dds', 'exr', 'dpx', 'ffs'
    // ]
    
    try {
        if (type === 'audio') {

            // mime lib automatically set mpga for audio/mpeg instead of mp3
            if (mime_type.match(/audio\/mpeg*/)) {
                return 'mp3'

            } else if (mime_type.match(/audio\/ogg/)) {
                return 'ogg'  

            } else {
                const extension = mime.getExtension(mime_type)
                console.log('asdadasdasda', mime.getExtension('audio/ogg'))
                if (!TD_SUPPORTED_AUDIO_EXTENSIONS.some(ext => ext === extension)) {
                    return null
                }

                return extension
            }
            
        } else if (type === 'video') {

            const extension = mime.getExtension(mime_type)
                
            if (!TD_SUPPORTED_VIDEO_EXTENSIONS.some(ext => ext === extension)) {
                return null
            }

            return extension

        } else {

            return null
        }
    } catch (err) {
        return null
    }
}

module.exports = {
    isUserAllowed,
    createMsgDir,
    createDownloadTokenForTD,
    chooseExtByMimeType,
    choosePhotoWithMaxResolution
}