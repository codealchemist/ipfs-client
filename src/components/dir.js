function dir (dir) {
  // console.log('Dir component:', dir)
  const { name, cid } = dir
  const html = `
    <div class="dir" title="${name}">
      <span>${name}</span>
    </div>
  `
  const div = document.createElement('div')
  div.setAttribute('data-cid', cid)
  div.setAttribute('data-name', name)
  div.onclick = function () {
    const event = new CustomEvent('dir-click', { detail: this.dataset })
    document.dispatchEvent(event)
  }
  div.innerHTML = html
  return div
}

export default dir
