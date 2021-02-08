import getFileType from '/util/get-file-type'
import audio from './audio'
import text from './text'

const contentMap = {
  audio,
  text
}

function getContent (file) {
  const type = getFileType(file.name)
  const content = contentMap[type] ? contentMap[type](file) : ''
  return content
}

export default getContent
