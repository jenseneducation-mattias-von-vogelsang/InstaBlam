/**** Imports ****/
import push from './modules/push-notifications.js'

/**** Global Variables & Dom-bound variables ****/
window.addEventListener('offline', checkOfflineDownload);
window.addEventListener('online', checkOfflineDownload);
let stream = {};
const sliderWrapper = document.querySelector('.sliderWrapper');
let imgUrl;
let filters = [];
const sliders = document.querySelectorAll('input[data-filter]');

/**** Function to screenshot videostream and save it to IMG ****/
async function printScreen(stream) {
  const mediaTrack = stream.getVideoTracks()[0];
  console.log(mediaTrack);
  const captureImg = new ImageCapture(mediaTrack);
  const photo = await captureImg.takePhoto();
  imgUrl = URL.createObjectURL(photo);
  console.log(imgUrl);
  //If statement to create canvas for first time and show sliders/buttons
  if (document.querySelector('canvas') == null) {
    document.querySelector('#photo').src = imgUrl;
    document.querySelector('#photo').classList.remove('hidden');
    renderCanvas('#photo', imgUrl);
    document.querySelector('.downloadWrapper').classList.remove('hidden');
    sliderWrapper.classList.remove('hidden');
    document.querySelector('#photo').scrollIntoView();
  }
  // If statement so re-doing screenshots is possible
  if (document.querySelector('canvas') !== null) {
    document.querySelector('#photo').removeAttribute('data-caman-id');
    const switch_img = imgUrl;
    resetValues();
    renderCanvas('#photo', switch_img);
    document.querySelector('#photo').scrollIntoView();
  }
}

/**** Save canvas src to download-target ****/
function saveCanvas() {
  document.querySelector('#download').href = document.querySelector('#photo').toDataURL(); //convert canvas image with multiple layers to base64
  document.querySelector('#download').download = 'my-instablam-picture.jpeg'; // Mention the file name and format to be downloaded
}

/**** Function to render canvas onto DOM ****/
function renderCanvas(DOMid, src) {
  Caman(DOMid, src, function () {
    //render canvas onto DOM
    this.render();
    //Change the download-target to canvas src
    saveCanvas();
  })
}

/**** Apply canvas filters based on slider values ****/
function applyFilters() {
  Caman('#photo', imgUrl, function () {
    this.revert(false);
    //loop through entries in filters object and apply them
    for (let [key, value] of Object.entries(filters)) {
      let fullSetting = `${key}${value}`;
      eval('this.' + fullSetting);
    }
    this.render(function () {
      //Apply settings and save to download-button href
      saveCanvas();
    });
  })
  return true;
}

/**** Update the values displayed next to sliders ****/
function updateSliderValues() {
  sliders.forEach((slider) => {
    //get custom attribute data-filter value
    let filter = slider.getAttribute('data-filter');
    //get slidervalue
    let value = slider.value;
    //display slidervalues
    const changevalue = `#${filter}value`;
    document.querySelector(changevalue).innerHTML = value;
  });
}

/**** Reset slidervalues & canvas filters completely ****/
function resetValues() {
  filters = [];
  document.querySelector('#settings').reset();
  updateSliderValues();
}

/**** Reset canvas settings and slider values ****/
function resetCanvas() {
  resetValues();
  Caman('#photo', function () {
    this.revert();
    saveCanvas();
  })
}

/**** Remove availability to download image if offline ****/
function checkOfflineDownload() {
  if (!navigator.onLine) {
    document.querySelector('#dwnldBtn').disabled = true;
    document.querySelector('#dwnldBtn').classList.toggle('hidden');
  } else if (navigator.onLine) {
    document.querySelector('#dwnldBtn').disabled = false;
    document.querySelector('#dwnldBtn').classList.toggle('hidden');
  }
}

/**** Get camera stream onto video DOM element ****/
async function getMedia() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: {
          ideal: 1280
        },
        height: {
          ideal: 720
        },
        facingMode: "user"
      }
    });
    const videoElem = document.querySelector('.camera');
    videoElem.srcObject = stream;
    videoElem.addEventListener('loadedmetadata', () => {
      videoElem.play();
    })
    console.log(stream);
  } catch (error) {
    console.log(error);
  }
}

/**** Eventlisteners & oninputs ****/
document.querySelector('.screenShot').addEventListener('click', event => {
  printScreen(stream);
})

sliders.forEach((slider) => {
  slider.onchange = async function () {
    //get filter type and value of slider and put into filters object
    let filter = this.getAttribute('data-filter');
    let value = this.value;
    let setting = '(' + value + ')'
    filters[filter] = setting;
    //display slidervalues
    const changevalue = `#${filter}value`;
    document.querySelector(changevalue).innerHTML = value;
    applyFilters();
  }
});

document.querySelector('#reset').addEventListener('click', function () {
  resetValues();
  resetCanvas();
})

/**** Function to register service worker sw.js ****/
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js')
      .then(() => {
        console.log('Registered service worker');
        push();
      })
      .catch((error) => console.log('Error while registering service worker ', error));
  }
}

/**** Call functions on script load ****/
getMedia();
registerServiceWorker();