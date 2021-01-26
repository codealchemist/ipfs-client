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
      for await (const fileUrl of loadFiles(links)) {
        console.log('FILE URL', fileUrl)
        const { name, url } = fileUrl
        document.body.innerHTML += `
          ${name} <audio src="${url}" controls="true"></audio><br />
        `
      }
    }

    async function * loadFiles (links) {
      while (links.length) {
        const { cid, name, size } = links.pop()
        const url = await loadFile(cid, name)
        const fileUrl = { name, url }
        yield fileUrl
      }
    }

    async function loadFile (cid, name) {
      try {
        const stream = await ipfs.cat(cid)
        const chunks = []
        for await (const chunk of stream) {
          chunks.push(chunk)
        }

        const blob = new Blob(chunks)
        return URL.createObjectURL(blob)
      } catch (error) {
        console.log(`ERROR loading file: ${name} / ${cid}`, error)
      }
    }
  }

  run()
})
