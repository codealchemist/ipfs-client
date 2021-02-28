import IPFS from 'ipfs'
import keys from '/util/keys'
import getFileElement from '/components/file'
import getDirElement from '/components/dir'
import mime from 'mime-types'

document.addEventListener('DOMContentLoaded', init)

async function init () {
  const ipfs = await IPFS.create()
  const $input = document.getElementById('cid')
  const $inputContainer = document.getElementById('input-container')
  const $container = document.getElementById('container')
  const $content = document.getElementById('content')
  const $iframe = document.getElementById('inline-content')
  const $loading = document.getElementById('loading')
  let hiddenLoadingText = true
  let loadingTextTimer
  const inlineContentStartWidth = 1024 // Start displaying inline content at 800px
  const cache = {}
  let isLoading = false
  let loadingHash
  console.log('NODE READY')

  keys('#cid', 'Enter', () => {
    const cid = $input.value
    if (!cid) return
    showContentView()
    load(cid)
  })

  keys('body', 'Escape', () => {
    resetView()
  })

  $container.addEventListener('click', event => {
    console.log('-- CLICK', event)
    const { path } = event
    if (!path) return

    path.some($el => {
      if ($el.nodeName == 'A') return true

      // Load file.
      if ($el.classList.contains('file')) {
        const { dataset } = $el
        event.stopPropagation()
        event.preventDefault()
        openFile(dataset)
        return true
      }

      // Load dir.
      if ($el.classList.contains('dir')) {
        const { dataset } = $el
        openDir(dataset)
        event.stopPropagation()
        event.preventDefault()
        return true
      }
    })
  })

  // Open file.
  document.addEventListener('file-click', ({ detail }) => {
    console.log('Open file', detail)
    const { url, name, size } = detail
    openContent({ url, name, size })
  })

  // Open dir.
  document.addEventListener('dir-click', ({ detail }) => {
    console.log('Open dir', detail)
    const { cid } = detail
    $content.innerHTML = '' // Clear content.
    load(cid)
  })

  // History navigation.
  window.onpopstate = event => {
    const { state } = event
    const { content, hash, partial } = state || {}
    if (partial) {
      console.log(`RESUME ${hash}`)
      $content.innerHTML = '' // Clear content.
      load(hash)
      return
    }

    $content.innerHTML = content
    if (!content) resetView()
  }

  function openFile (data) {
    console.log('Open file', data)
    const { url, name, size } = data
    openContent({ url, name, size })
  }

  function openDir (data) {
    console.log('Open dir', data)
    const { cid } = data
    $content.innerHTML = '' // Clear content.
    load(cid)
  }

  function openContent ({ url, name, size }) {
    console.log('Open content', window.innerWidth, inlineContentStartWidth)
    // Open in new window.
    if (window.innerWidth < inlineContentStartWidth) {
      console.log('Open URL in new window')
      window.open(url)
      return
    }

    // Display inline content.
    $iframe.onload = () => {
      const $iframeBody = $iframe.contentWindow.document.querySelector('body')
      $iframeBody.style.color = '#ddd'
    }
    $iframe.src = url
    showInlineContent()
  }

  function showInlineContent () {
    $container.classList.add('inline-content')
  }

  function hideInlineContent () {
    $container.classList.remove('inline-content')
  }

  function showContentView () {
    $content.classList.add('show')
    $content.classList.remove('hide')
    $inputContainer.classList.add('hide')
    $inputContainer.classList.remove('show')
  }

  function resetView () {
    hideInlineContent()
    $content.innerHTML = '' // Clear content.
    $content.classList.add('hide')
    $content.classList.remove('show')
    $inputContainer.classList.add('show')
    $inputContainer.classList.remove('hide')
  }

  function setLoading (percentage) {
    $loading.style.width = `${percentage}vw`
  }

  function showLoading () {
    isLoading = true
    loadingTextTimer = setTimeout(() => {
      hiddenLoadingText = false
      $loading.classList.add('init')
    }, 1000)
    $loading.style.opacity = '1'
  }

  function hideLoading () {
    isLoading = false
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

  function setHistory (hash, partial = false) {
    window.history.pushState(
      { content: $content.innerHTML, partial, hash },
      null,
      hash
    )
  }

  async function load (hash) {
    if (isLoading) hideLoading()
    loadingHash = hash
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
    for await (const fileObj of loadItems(links)) {
      if (loadingHash != hash) {
        setHistory(hash, true)
        console.log(`CANCEL loading ${hash}`)
        return
      }

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

      // Hide loading text.
      if (!hiddenLoadingText) {
        clearTimeout(loadingTextTimer)
        $loading.classList.remove('init')
      }
    }
    hideLoading()
    cache[hash] = $content.innerHTML
    setHistory(hash)
  }

  // Load files and dirs.
  async function * loadItems (links) {
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

      const mimeType = mime.lookup(name)
      const blob = new Blob(chunks, { type: mimeType })
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

  // Read hash from URL.
  const hash = window.location.pathname.replace('/', '')
  if (hash) {
    console.log(`Auto loading hash: ${hash}`)
    showContentView()
    load(hash)
  }
}
