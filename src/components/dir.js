function dir (dir) {
  // console.log('Dir component:', dir)
  const { name, cid } = dir
  const html = `
    <div class="dir" data-cid="${cid}">
      <span>${name}</span>
    </div>
  `
  return html
}

export default dir
