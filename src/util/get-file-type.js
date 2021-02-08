const fileExtMap = {
  audio: /(mp3|ogg|wav|flac)$/i,
  video: /(mp4|webm|avi|ogv|)$/i,
  text: /(txt|md)$/i
}
const types = Object.keys(fileExtMap)

function getFileType (filename) {
  let fileType
  types.some(type => {
    const regex = fileExtMap[type]
    if (filename.match(regex)) {
      fileType = type
      return true
    }
    return
  })

  return fileType
}

export default getFileType
