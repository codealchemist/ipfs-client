function dir (dir) {
  // console.log('Dir component:', dir)
  const { name, cid } = dir
  const html = `
    <div class="dir" data-cid="${cid}">
      <span>${name}</span>
    </div>
  `
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}

export default dir
