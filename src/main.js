// TODO: Make the caption appear, if available, once the video starts. Currently, we wait for user input or for screen resize.
// TODO: Create class to hold all variables relating to a caption blocker.
  // TODO: Give variables proper names, instead of "x" and "submissionHeight".
// TODO: Send screenshot of video over to Python server for auto caption detection (if possible).
// TODO: Store data somewhere in global, or in the CaptionBlocker class, to avoid reloading it on resize.
window.addEventListener("load", go);
window.addEventListener('resize', go);
window.addEventListener('fullscreenchange', go);

const URL = 'http://127.0.0.1:5000/videos';
var CB = null;

class CaptionBlocker {
  constructor() {
    this.x      = null;
    this.y      = null;
    this.height = null;
    this.width  = null;
  }

  ClearVars(context) {
    if (context == null) { return; }
    context.clearRect(0, 0, this.width, this.height); // Is this needed? Since the next line removed the canvas
    this.x      = null;
    this.y      = null;
    this.width  = null;
    this.height = null;
  }

  Draw(context) {
    this.ClearVars();
    let video = document.getElementsByClassName('video-stream html5-main-video')[0];
    let rect = video.getBoundingClientRect();
    let tmpCanvas = document.createElement('canvas');
    this.SetVars(video, rect, tmpCanvas);

    // Set offset using style:
    // Source: https://www.reddit.com/r/learnjavascript/comments/uy3zvd/how_to_set_the_offset_of_an_element_with_vanilla/
    // Source: https://www.javaspring.net/blog/how-to-set-the-offset-in-javascript/
    tmpCanvas.id = "CursorLayer";
    tmpCanvas.style.left = `${this.x}px`;
    tmpCanvas.style.top = `${this.y}px`;
    tmpCanvas.width = this.width;
    tmpCanvas.height = this.height;
    tmpCanvas.style.zIndex = 8; // Do we need this?
    tmpCanvas.style.position = "absolute"; // Do we need this? 
    // canvas.style.border = "1px solid"; // Do we need this? 

    let body = document.getElementsByTagName("body")[0];
    body.appendChild(tmpCanvas);

    context = tmpCanvas.getContext("2d");
    context.fillStyle = "rgba(0, 0, 0, 1)";
    context.fillRect(0, 0, this.width, this.height);
    return; 
  }

  SetVars(video, rect, tmpCanvas) {
    let submissionsWidth  = data.x_res;
    let submissionsHeight = data.y_res;
    this.x = rect.left + (data.x_cord * rect.width  / submissionsWidth);
    this.y = rect.top  + (data.y_cord * rect.height / submissionsHeight);
    this.width  = data.length * rect.width  / submissionsWidth;
    this.height = data.height * rect.height / submissionsHeight;
  }
}

/**
 * TODO: Remove if this is not needed. It is not called anywhere.
 * Source: https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
 */
function waitForElementToLoad(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
    }
    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
          observer.disconnect();
          resolve(document.querySelector(selector));
      }
    });
    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

/**
 * Fetch data if null, then call drawRectangleFromAPI
 */
async function go() {
  let data;
  if (data == null) {
    let video_id = extractYouTubeID(window.location.href);
    if (video_id == null){
      return;
    }
    await makeGetRequest(video_id);
  }
  drawRectangleFromAPI(data);
}

/**
 * Use a regular expression to extract ID from a YouTube URL
 * @param {String} YouTube video URL
 * @return {String} ID of YouTube video
 */
function extractYouTubeID(videoURL) {
  // Source: https://www.geeksforgeeks.org/javascript/get-the-youtube-video-id-from-a-url-using-javascript/
  let VID_REGEX = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  if (videoURL.match(VID_REGEX) == null) {
    console.error("YouTube video ID could not be found. Make sure you are on a valid YouTube video page.")
    return null;
  }
  return videoURL.match(VID_REGEX)[1];
}

/**
 * Make GET request to the server, and fetch data
 * @param {String} YouTube video ID
 */
async function makeGetRequest(video_id) {
  try
  {
    // The parameter for fetch should be in this format:
    // http://127.0.0.1:5000/videos?video_id=video_id
    const response = await fetch(URL + "?video_id=" + video_id);
    if (!response.ok) { throw new Error(`Response status: ${response.status}`); }
    data = await response.json();
  }
  catch (error)
  {
    console.error(error.message);
  }
}

/**
 * Draw the rectangle according to the data given as a response to the API fetch
 * @param {data} response from the GET request
 */
async function drawRectangleFromAPI(data) {
  let video = document.getElementsByClassName('video-stream html5-main-video')[0];
  rect = video.getBoundingClientRect();
  let tmpCanvas = document.createElement('canvas');
  
  if (CB != null) { deleteCapper(); }
  CB = new CaptionBlocker()
  CB.SetVars(video, rect, tmpCanvas);
  let ctx = tmpCanvas.getContext("2d");
  CB.Draw(ctx);
  return; 
}

/**
 * Clear rectangle, remove the canvas, and set variables to null
 */
function deleteCapper() {
  console.log("Deleting caption blocker...");
  let body = document.getElementsByTagName("body")[0];
  // Set context, and keep removing child until none are left
  let removeCtx = document.getElementById("CursorLayer");
  while (removeCtx != null) {
    body.removeChild(removeCtx);
    removeCtx = document.getElementById("CursorLayer");
  }
  console.log("Caption blocker deleted...");
}

/**
 * To be called for when a user wants to submit an entry
 */
function drawRectangleUsingMouse() {
  // Draw rectangle using click and drag
  // Source: https://jsfiddle.net/eyaylagul/nho08juw/
  let video = document.getElementsByClassName('video-stream html5-main-video')[0];
  rect = video.getBoundingClientRect();
  var canvas = document.createElement('canvas');

  canvas.id = "CursorLayer";
  canvas.style.left = `${rect.left}px`;
  canvas.style.top = `${rect.top}px`;
  canvas.width = rect.width;
  canvas.height = rect.height;
  canvas.style.zIndex = 8;
  canvas.style.position = "absolute";

  let body = document.getElementsByTagName("body")[0];
  body.appendChild(canvas);
  let drawingCtx = canvas.getContext("2d");

  let drawingHeight = null;
  let drawingWidth  = null;
  let canvasx = $(canvas).offset().left - window.pageXOffset;
  let canvasy = $(canvas).offset().top - window.pageYOffset;
  let last_mousex = last_mousey = 0;
  let mousex = mousey = 0;
  let mousedown = false;

  $(canvas).on('mousedown', function(e) {
    last_mousex = parseInt(e.clientX-canvasx);
    last_mousey = parseInt(e.clientY-canvasy);
    mousedown = true;
  });

  // TODO: Right now, we assume the user will be satisfied with the rectangle upon lifting the mouse
  // This gives the user no chance to adjust or fix the rectangle
  $(canvas).on('mouseup', function(e) {
      mousedown = false;
      sendCapper(canvas, drawingCtx, last_mousex, last_mousey, drawingWidth, drawingHeight);
  });

  $(canvas).on('mousemove', function(e) {
    mousex = parseInt(e.clientX-canvasx);
    mousey = parseInt(e.clientY-canvasy);
    if(mousedown) {
      drawingCtx.clearRect(0,0,canvas.width,canvas.height); //clear canvas
      drawingCtx.beginPath();
      drawingWidth = mousex-last_mousex;
      drawingHeight = mousey-last_mousey;
      drawingCtx.rect(last_mousex,last_mousey,drawingWidth,drawingHeight);
      drawingCtx.strokeStyle = 'black';
      drawingCtx.lineWidth = 10;
      drawingCtx.stroke();
    }
  });
}

/**
 * Make a POST request to send the rectangle along with the coordinates
 * @param {Element} canvas  element where rectangle is located 
 * @param {Element} ctx     rectangle element
 * @return {Int}    x_cord  Location of the upper-left corner of the rectangle along x-axis
 * @return {Int}    y_cord   Location of the upper-left corner of the rectangle along y-axis
 * @return {Int}    length  Length of the rectangle, in pixels
 * @return {Int}    height  height of the rectangle, in pixels
 */
async function sendCapper(canvas, ctx, x_cord, y_cord, length, height) {
  let video = document.getElementsByClassName('video-stream html5-main-video')[0];
  rect = video.getBoundingClientRect();
  ctx.clearRect(0,0,canvas.width,canvas.height); 
  let body = document.getElementsByTagName("body")[0];
  body.removeChild(canvas);

  x_resolution = rect.width;
  y_resolution = rect.height;

  var video_id = extractYouTubeID(window.location.href);
  if (video_id == null){
    return;
  }
  var postJson = buildPostJson(video_id, x_cord, y_cord, height, length, x_resolution, y_resolution);

// a POST request
  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(postJson)
  })
}

function buildPostJson(video_id, x_cord, y_cord, height, length, x_resolution, y_resolution) {
  var tmpJson = {};
  tmpJson.video_id = video_id;
  tmpJson.x_cord = x_cord;
  tmpJson.y_cord = y_cord;
  tmpJson.height = height;
  tmpJson.length = length;
  tmpJson.x_res = x_resolution;
  tmpJson.y_res = y_resolution;
  return tmpJson;
}

function takeScreenshot(){
    let video = document.getElementsByClassName('video-stream html5-main-video')[0];
    let rect = video.getBoundingClientRect();
    let can = document.createElement('canvas');

    let x = rect.left;
    let y = rect.top;
    let width  = rect.width;
    let height = rect.height;

    can.id = "myCanvas";
    can.style.left = `${x}px`;
    can.style.top = `${y}px`;
    can.width = width;
    can.height = height;
    can.style.zIndex = 8; 
    can.style.position = "absolute"; 

    let body = document.getElementsByTagName("body")[0];
    body.appendChild(can);

    //draw image to canvas. scale to target dimensions
    let ctx = can.getContext("2d");
    ctx.drawImage(video, 0, 0, can.width, can.height);

    //convert to desired file format
    let dataURI = can.toDataURL('image/jpeg'); // can also use 'image/png'
    var video_id = extractYouTubeID(window.location.href);
    if (video_id == null){ return; }
    makePostRequest(video_id, dataURI);

    let removeCtx = document.getElementById("myCanvas");
    while (removeCtx != null) {
      body.removeChild(removeCtx);
      removeCtx = document.getElementById("myCanvas");
    }
}

async function makePostRequest(video_id, data){
  let dataJSON = {};
  dataJSON.video_id = video_id;
  dataJSON.data = data;
  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(dataJSON)
  })
}

async function analyzePage() {
  console.log("Block function called, now in analyzePage");
  go();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "block") {
    sendResponse(analyzePage());
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "drawBlocker") {
    console.log("Draw caption blocker called");
    sendResponse(drawRectangleUsingMouse());
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "removeBlocker") {
    console.log("Remover caption blocker called");
    sendResponse(deleteCapper());
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "takeScreenshot") {
    console.log("Take screenshot called");
    sendResponse(takeScreenshot());
  }
});
