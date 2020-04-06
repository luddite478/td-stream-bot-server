const path = require('path')
const fs = require('fs')

function findFilePathsForDownload (token) {
    try {
        const requestFolder = fs.readdirSync(`${msgsDir}`, { withFileTypes: true })
            .filter(dir => dir.isDirectory())
            .map(dir => dir.name)
            .find(dir => {
                const arr = dir.split('_')
                const lastNumber = arr[arr.length - 1]
                return token === lastNumber
            })

        if (!requestFolder) {
            throw new Error('Can not get request folder')
        }

        const requestFolderAbsPath = path.join(msgsDir, `${requestFolder}`)
        
        const fileNames = fs.readdirSync(requestFolderAbsPath)
            .map(fileName => path.join(requestFolderAbsPath, fileName))
        
        
        return fileNames
    } catch (err) {
        console.log(err)
    }
}

module.exports = (req, res) => {
    try {
        const token = req.header('token')

        if (!token) {
            throw new Error('Token was not specified')
        }

        const filePaths = findFilePathsForDownload(token) 

        if (!filePaths) {
            throw new Error(`Can not find file associated with token ${token}`)
        }

        if (filePaths.length !== 0) {
            res.sendFile(filePaths[0]) // !! [0]  
        } else {
            throw new Error('')
        }

    } catch (error) {
        console.log(error)
        res.code(500)
    }
}

