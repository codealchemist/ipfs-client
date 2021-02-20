import getFileType from '/util/get-file-type'
import audio from './audio'
import text from './text'
import image from './image'
import any from './any'

const contentMap = {
  audio,
  text
}

function getContent (file) {
  const type = getFileType(file.name)
  console.log('TYPE:', type)
  const content = contentMap[type] ? contentMap[type](file) : any(file)
  return content
}

export default getContent
