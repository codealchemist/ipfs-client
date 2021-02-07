import IPFS from 'ipfs'
import keys from '/util/keys'
import getFileElement from '/components/file'
import getDirElement from '/components/dir'

const hash = 'QmdtfpaENoJYEyjH3x3drcTHsfJZoDSo5rAuMCTKjbAhvY'

document.addEventListener('DOMContentLoaded', init)

async function init () {
  const ipfs = await IPFS.create()
  const $input = document.getElementById('cid')
  const $inputContainer = document.getElementById('input-container')
  const $content = document.getElementById('content')
  const $loading = document.getElementById('loading')
  const cache = {}
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
    resetView()
  })

  function resetView () {
    $content.innerHTML = '' // Clear content.
    $content.classList.add('hide')
    $content.classList.remove('show')
    $inputContainer.classList.add('show')
    $inputContainer.classList.remove('hide')
  }

  $content.addEventListener('click', event => {
    const { target } = event
    const { className } = target
    if (!className || className != 'dir') return
    console.log('LOAD DIR', target.dataset)
    const { cid } = target.dataset

    $content.innerHTML = '' // Clear content.
    load(cid)
  })

  window.onpopstate = event => {
    const { state } = event
    const content = state?.content || ''
    $content.innerHTML = content
    if (!content) resetView()
  }

  function setLoading (percentage) {
    $loading.style.width = `${percentage}vw`
  }

  function showLoading () {
    $loading.style.opacity = '1'
  }

  function hideLoading () {
    $loading.style.opacity = '0'
    setTimeout(() => {
      $loading.style.width = '0vw'
    }, 500)
  }

  function loadFromCache (hash) {
    const content = cache[hash]
    $content.innerHTML = content
    setHistory(hash)
  }

  function setHistory (hash) {
    window.history.pushState({ content: $content.innerHTML }, null, hash)
  }

  async function load (hash) {
    // const id = await ipfs.id()
    // console.log('IPFS NODE created:', id)
    if (cache[hash]) {
      loadFromCache(hash)
      return
    }

    console.log(`Loading ${hash}...`)
    const node = await ipfs.dag.get(hash)
    // console.log('NODE', node)
    const { data, links } = node.value.toJSON()
    // console.log('LINKS', links)
    const total = links.length
    let loadedItems = 0
    showLoading()
    for await (const fileObj of loadFiles(links)) {
      let item
      if (fileObj.url) {
        // File.
        item = getFileElement(fileObj)
      } else {
        // Dir.
        item = getDirElement(fileObj)
      }
      $content.appendChild(item)
      loadedItems += 1

      const percentage = Math.round((loadedItems * 100) / total)
      setLoading(percentage)
    }
    hideLoading()
    cache[hash] = $content.innerHTML
    setHistory(hash)
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
