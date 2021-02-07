import prettyBytes from 'pretty-bytes'

const fileExtMap = {
  audio: /(mp3|ogg|wav|flac)$/i,
  video: /(mp4|webm|avi|ogv|)$/i,
  text: /(txt|md)$/i
}
const types = Object.keys(fileExtMap)
const contentMap = {
  audio: ({ name, url, size }) => `
    <span class="right">
      <audio src="${url}" controls="true"></audio>
    </span>
  `
}

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

function getContent (file) {
  const type = getFileType(file.name)
  const content = contentMap[type] ? contentMap[type](file) : ''
  return content
}

let altRow = false
function file (file) {
  console.log('File component:', file)
  const { name, url, size } = file
  const content = getContent(file)
  const html = `
    <span>${name}</span>
    <span>${prettyBytes(size)}</span>
    ${content}
  `
  altRow = !altRow
  const div = document.createElement('div')
  div.className = `file${altRow ? ' alt' : ''}`
  div.innerHTML = html
  return div
}

export default file
