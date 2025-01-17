// check if we're running in dev mode
const fs = require('fs')
const path = require('path')
const srcPath = path.resolve(path.join(__dirname, './src'))
const isDevMode = fs.existsSync(srcPath)
// or want to "force" running the compiled version with PANDA_CLI_MODE=compiled
const wantsCompiled = process.env.PANDA_CLI === 'compiled'

let plugin = {}

if (wantsCompiled || !isDevMode) {
  // this runs from the compiled javascript source
  plugin = require(`./dist/index.js`)
} else {
  const workspacePackagesDir = path.resolve(__dirname, '..')
  const symlink = require('@pandacss/symlink')

  const unregister = symlink({
    workspacePackagesDir,
    requireSource: () => {
      plugin = require('./index')
    },
  })

  unregister()
}

module.exports = plugin
