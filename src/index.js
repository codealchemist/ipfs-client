import IPFS from 'ipfs'

const hash = 'QmdtfpaENoJYEyjH3x3drcTHsfJZoDSo5rAuMCTKjbAhvY'

document.addEventListener('DOMContentLoaded', async () => {
  const ipfs = await IPFS.create()
  console.log('NODE READY')

  async function run () {
    load(hash)

    async function load (hash) {
      // const id = await ipfs.id()
      // console.log('IPFS NODE created:', id)

      console.log(`Loading ${hash}...`)
      const node = await ipfs.dag.get(hash)
      console.log('NODE', node)
      const { data, links } = node.value.toJSON()
      console.log('LINKS', links)
      let html = ''
      for await (const fileUrl of loadFiles(links)) {
        console.log('FILE URL', fileUrl)
        const { name, url } = fileUrl
        html += `
          ${name} <audio src="${url}" controls="true"></audio><br />
        `
      }
      document.body.innerHTML += html
    }

    async function * loadFiles (links) {
      while (links.length) {
        const link = links.pop()
        console.log('LINK', link)
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

  run()
})
