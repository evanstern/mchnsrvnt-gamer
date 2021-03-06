import path from 'path'
import gaze from 'gaze'
import replace from 'replace'
import Promise from 'bluebird'

async function copy ({ watch } = {}) {
    const ncp = Promise.promisify(require('ncp'))

    await Promise.all([
        ncp('src/public', 'build/public'),
        ncp('src/content', 'build/content'),
        ncp('package.json', 'build/package.json'),
    ])

    // update 'start' commands
    replace({
        regex: '"start".*',
        replace: '"start": "node server.js"',
        paths: ['build/package.json'],
        recursive: false,
        silent: false,
    })

    // maybe watch the files for updates and re-copy
    if (watch) {
        const watcher = await new Promise((resolve, reject) => {
            gaze('src/content/**/*.*', (err, val) => err ? reject(err) : resolve(val))
        })
        watcher.on('changed', async (file) => {
            const relPath = file.substr(path.join(__dirname, '../src/content/').length)
            await ncp(`src/content/${relPath}`, `build/content/${relPath}`)
        })
    }
}

export default copy
