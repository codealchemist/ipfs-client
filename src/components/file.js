import prettyBytes from 'pretty-bytes'
import getContent from './content'

let altRow = false
function file (file) {
  // console.log('File component:', file)
  const { name, url, size } = file
  const content = getContent(file)

  const html = `
    <div class="name ${content ? 'with-content' : ''}">
      <span class="left truncate">${name}</span>
      ${content}
    </div>
    <span class="right">${prettyBytes(size)}</span>
    <span class="right actions">
      <a class="any" href="${url}" target="_blank">🔗</a>
    </span>
  `
  altRow = !altRow
  const div = document.createElement('div')
  div.title = name
  div.setAttribute('data-url', url)
  div.setAttribute('data-name', name)
  div.setAttribute('data-size', size)
  div.className = `file${altRow ? ' alt' : ''}`
  div.innerHTML = html
  return div
}

export default file
