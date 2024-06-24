const path = require('path')
const os = require('os')
const fs = require('fs')
const resizeImg = require('resize-img')
const { BrowserWindow, app, Menu, ipcMain, shell } = require("electron");

const isDev = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin' //checking for mac os. to include additional codes to make cross platform app.
let mainWindow

//create main window
const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        title: "image Resizer",
        width: 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    //open dev tools on dev environment
    //mainWindow.webContents.openDevTools()
    if (isDev) { mainWindow.loadFile(path.join(__dirname, "./renderer/index.html")) }
}
//create about window

const createAboutWindow = () => {
    const aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width: 300,
        height: 300
    })
    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'))
}

//is app ready
app.whenReady().then(() => {
    createMainWindow()
    const mainMenu = Menu.createMainWindow(menu)
    Menu.setApplicationMenu(mainMenu)
    //close main window
    mainWindow.on('closed', () => mainWindow = null)
    //implement menu
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow()
        }
    })
})

//menu template
const menu = [
    ...(isMac
        ? [
            {
                label: app.name,
                submenu: [
                    {
                        label: 'About',
                        click: createAboutWindow,
                    },
                ],
            },
        ]
        : []),
    {
        role: 'fileMenu',
    },
    ...(!isMac
        ? [
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'About',
                        click: createAboutWindow,
                    },
                ],
            },
        ]
        : []),
    // {
    //   label: 'File',
    //   submenu: [
    //     {
    //       label: 'Quit',
    //       click: () => app.quit(),
    //       accelerator: 'CmdOrCtrl+W',
    //     },
    //   ],
    // },
    // ...(isDev
    //   ? [
    //       {
    //         label: 'Developer',
    //         submenu: [
    //           { role: 'reload' },
    //           { role: 'forcereload' },
    //           { type: 'separator' },
    //           { role: 'toggledevtools' },
    //         ],
    //       },
    //     ]
    //   : []),
];

// send image to main
ipcMain.on('resizeImage', (
    (e, options) => {
        options.dest = path.join(os.homedir(), 'imageresizer')
        resizeImage(options)

    }))
//resize image
async function resizeImage({ width, height, imgPath, dest }) {
    try {
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height,
        })
        //create file name    
        const filename = path.basename(imgPath)

        //create destination folder if not already exists
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest)
        }
        //write file to the destination
        fs.writeFileSync(path.join(dest, filename), newPath)

        //send success to renderer
        mainWindow.webContents.send('imageDone')

        //open dest folder
        shell.openPath(dest)
    }
    catch (error) {
        console.log(error)
    }
}
//for mac os compatibility
app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})
