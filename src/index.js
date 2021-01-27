import IPFS from 'ipfs'
import keys from '/util/keys'

const hash = 'QmdtfpaENoJYEyjH3x3drcTHsfJZoDSo5rAuMCTKjbAhvY'

document.addEventListener('DOMContentLoaded', init)

async function init() {
  const ipfs = await IPFS.create()
  const $input = document.getElementById('cid')
  const $inputContainer = document.getElementById('input-container')
  const $content = document.getElementById('content')
  console.log('NODE READY')

  keys('#cid', 'Enter', () => {
    const cid = $input.value
    if (!cid) return

    $content.classList.add('show')
    $content.classList.remove('hide')
    $inputContainer.classList.add('hide')
    $inputContainer.classList.remove('show')
    load(cid)
  })

  keys('body', 'Escape', () => {
    $content.innerHTML = '' // Clear content.
    $content.classList.add('hide')
    $content.classList.remove('show')
    $inputContainer.classList.add('show')
    $inputContainer.classList.remove('hide')
  })

  async function load (hash) {
    // const id = await ipfs.id()
    // console.log('IPFS NODE created:', id)

    console.log(`Loading ${hash}...`)
    const node = await ipfs.dag.get(hash)
    // console.log('NODE', node)
    const { data, links } = node.value.toJSON()
    // console.log('LINKS', links)
    for await (const fileUrl of loadFiles(links)) {
      // console.log('FILE URL', fileUrl)
      const { name, url } = fileUrl
      $content.innerHTML += `
        ${name} <audio src="${url}" controls="true"></audio><br />
      `
    }
  }

  async function * loadFiles (links) {
    while (links.length) {
      const link = links.pop()
      // console.log('LINK', link)
      const { cid, name, size } = link
      const { type, url } = await loadData(cid, name)
      const item = { name, cid, size, type, url }
      yield item
    }
  }

  async function loadData (cid, name) {
    try {
      const stream = await ipfs.cat(cid)
      const chunks = []
      for await (const chunk of stream) {
        chunks.push(chunk)
      }

      const blob = new Blob(chunks)
      const url = URL.createObjectURL(blob)
      return {
        url,
        type: 'file'
      }
    } catch (error) {
      // Generic error.
      if (!error.toString().match('is a directory')) {
        console.log(`ERROR loading file: ${name} / ${cid}`, error)
        return
      }

      // Return directory.
      return {
        type: 'directory'
      }
    }
  }
}
