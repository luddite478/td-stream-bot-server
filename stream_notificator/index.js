Tail = require('tail').Tail
const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')
require('dotenv').config()
const EASYDARWIN_LOG_PATH = process.env.EASYDARWIN_LOG_PATH
const logPath = path.normalize(EASYDARWIN_LOG_PATH)

let tail = null
function setWatcherToLatestLogFile (io, logFiles, logPath) {
    let latestLogFileName = ''
    let latestDate = 0
    logFiles.forEach(file => {
        const date = parseInt(file.split('-')[1], 10)
        if (date > latestDate) {
            latestDate = date
            latestLogFileName = file  
        }
    })
    const latestLogFilePath = path.join(logPath, latestLogFileName)
    tail = new Tail(latestLogFilePath)
    tail.on("line", (line) => handleNewLogLine(io, line))
}

function handleNewLogLine (io, line) {
    const firstWord = line.split(' ')[0]

    if (firstWord === 'RECORD') {
        const streamUrl = line.split(' ')[1]
        console.log('New broadcast', streamUrl)
        io.emit('rtsp_broadcast_start', streamUrl)
    }

    if (firstWord === 'TEARDOWN') {
        const streamUrl = line.split(' ')[1]
        console.log('Broadcast stop', streamUrl)
        io.emit('rtsp_broadcast_end', streamUrl)
    }
}

function handleNewLogFile (io, logPath) { 
    if (path.extname(logPath) === '.log_lock') {
        return
    }

    if (!tail) {
        return
    }

    tail.unwatch()
    tail = new Tail(logPath)
    tail.on("line", (line) => handleNewLogLine(io, line))
}

function handleWatchDirError (err) {
    console.log(err)
}

module.exports = (io) => {
    const logFiles = fs.readdirSync(logPath)
    
    if (logFiles.length !== 0) {
        setWatcherToLatestLogFile(io, logFiles, logPath)
    }

    const watcher = chokidar.watch(logPath, { ignored: /^\./, persistent: true })
    watcher
        .on('add', (path) => handleNewLogFile(io,path))
        .on('error', handleWatchDirError)
}
