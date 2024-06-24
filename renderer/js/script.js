
const form = document.querySelector('#img-form')
const img = document.querySelector('#img')
const outputPath = document.querySelector('#output-path')
const filename = document.querySelector('#filename')
const heightInput = document.querySelector('#height')
const widthInput = document.querySelector('#width')

function loadImage(e) {
  const file = e.target.files[0]
  if (!isImage(file)) {
    alertErr('Please Select an Image')
    return
  }
  //to get original height and width
  const image = new Image()
  image.src = URL.createObjectURL(file)
  image.onload = function () {
    widthInput.value = this.width
    heightInput.value = this.height
    outputPath.innerText = path.join(os.homedir(), 'imageresizer')
  }

  form.style.display = 'block'
  filename.innerText = file.name
}

//send image to main
function sendImage(e) {
  const imgPath = img.files[0].path
  const width = widthInput.value
  const height = heightInput.value

  e.preventDefault()

  if (!img.files[0]) {
    alertErr('Please Select an Image')
    return
  }
  if (width === '' || height === '') {
    alertErr('Please give height and width ')
    return
  }
  ipcRenderer.send('resizeImage', {
    width,
    height,
    imgPath
  })
}
//catch image done event
ipcRenderer.on('imageDone', () => {
  alertSuccess(`Image resized to ${heightInput.value}X ${widthInput.value}`)
})
//make sure the file is image
function isImage(file) {
  const supportedImages = ["image/gif", "image/jpeg", "image/png"]
  return file && supportedImages.includes(file['type'])
}

//toastify alerts

function alertErr(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center'
    }
  })
}
function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center'
    }
  })
}
img.addEventListener('change', loadImage)
form.addEventListener('submit', sendImage)