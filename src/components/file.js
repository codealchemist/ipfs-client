import prettyBytes from 'pretty-bytes'

let altRow = false
function file (file) {
  // console.log('File component:', file)
  const { name, url, size } = file
  const html = `
    <div class="file${altRow ? ' alt' : ''}">
      <span>${name}</span>
      <span>${prettyBytes(size)}</span>
      <div class="right">
        <audio src="${url}" controls="true"></audio>
      </div>
    </div>
  `
  altRow = !altRow
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}

export default file
