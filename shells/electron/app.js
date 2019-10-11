// Start middleware server
require('./server')

const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')

let mainWindow = null
const defaultTitle = 'Vue Developer Tools'

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'icons/128.png'),
    title: process.env.TITLE || defaultTitle
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
