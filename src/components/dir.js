function dir (dir) {
  // console.log('Dir component:', dir)
  const { name, cid } = dir
  const html = `
    <div title="${name}">
      <span>${name}</span>
    </div>
  `
  const div = document.createElement('div')
  div.setAttribute('data-cid', cid)
  div.setAttribute('data-name', name)
  div.setAttribute('class', 'dir')
  div.innerHTML = html
  return div
}

export default dir
