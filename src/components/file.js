import prettyBytes from 'pretty-bytes'
import getContent from './content'

let altRow = false
function file (file) {
  // console.log('File component:', file)
  const { name, url, size } = file
  const content = getContent(file)
  const html = `
    <span class="truncate">${name}</span>
    <span>${prettyBytes(size)}</span>
    ${content}
  `
  altRow = !altRow
  const div = document.createElement('div')
  div.title = name
  div.setAttribute('data-url', url)
  div.setAttribute('data-name', name)
  div.setAttribute('data-size', size)
  div.className = `file${altRow ? ' alt' : ''}`
  div.onclick = function () {
    const event = new CustomEvent('file-click', { detail: this.dataset })
    document.dispatchEvent(event)
  }
  div.innerHTML = html
  return div
}

export default file
