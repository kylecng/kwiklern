import fs from 'fs'
import path from 'path'
console.log('POSTDEV')

const directoryPath = 'build/vendor'
// const searchFile = '@extractus_article-extractor.js'
const searchFile = ''
const searchText = [
  `\\sconsole.warn\\(\`Module "source-map-js" has been externalized for browser compatibility. Cannot access "source-map-js.\\$\\{key\\}" in client code. See http://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.\`\\);`,
  `\\sconsole.warn\\(\`Module "perf_hooks" has been externalized for browser compatibility. Cannot access "perf_hooks.\\$\\{key2\\}" in client code. See http://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.\`\\);`,
].join('|')

function removeLinesFromFile() {
  try {
    fs.readdir(directoryPath, (err, files) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error reading directory:', err)
        return
      }

      if (!files) return

      files.forEach((file) => {
        const filePath = path.join(directoryPath, file)
        if (filePath.includes(searchFile) || !searchFile) {
          fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
              console.error(`Error reading file ${file}:`, err)
            } else {
              const updatedContent = data.replace(new RegExp(searchText, 'g'), ``)
              if (updatedContent !== data) {
                fs.writeFile(filePath, updatedContent, 'utf-8', (err) => {
                  if (err && err.code !== 'ENOENT') {
                    console.error('Error writing to the file:', err)
                  } else {
                    // console.log('Text replaced successfully.')
                  }
                })
              }
            }
          })
        }
      })
    })
  } catch {}
}

const intervalId = setInterval(removeLinesFromFile, 3000)
