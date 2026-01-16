const URL = 'http://127.0.0.1:5000/videos';
var response;
var data;
var body;

var startX;
var startY;
var isDrawing;

var video;
var rect;
var tmpCanvas;
var x;
var y;
var ctx;
var height;
var width;
var submissionsHeight;
var submissionsWidth;

var drawingCtx;
var drawingHeight;
var drawingWidth;

window.addEventListener("load", go);
window.addEventListener('resize', go);
window.addEventListener('fullscreenchange', go);

/**
 * Fetch data if null, then call drawRectangleFromAPI
 */
async function go() {
  if (data == null) {
    let id = extractYouTubeID(window.location.href);
    await makeGetRequest(id);
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
  let VID_REGEX =
  /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return videoURL.match(VID_REGEX)[1];
}

/**
 * Make GET request to the server, and fetch data
 * @param {String} YouTube video ID
 */
async function makeGetRequest(video_id) {
  try {
    // The parameter for fetch should be in this format:
    // http://127.0.0.1:5000/videos?video_id=video_id
    const response = await fetch(URL + "?video_id=" + video_id);
    if (!response.ok) { throw new Error(`Response status: ${response.status}`); }

    data = await response.json();
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Adjust the width, heigh, and coordinates of the rectangle
 */
function setVars() {
  submissionsWidth = data.x_res;
  submissionsHeight = data.y_res;
  x = rect.left + (data.x_cord * rect.width / submissionsWidth);
  y = rect.top + (data.y_cord * rect.height / submissionsHeight);
  width = data.length * rect.width / submissionsWidth;
  height = data.height * rect.height / submissionsHeight;
}

/**
 * Draw the rectangle according to the data given as a response to the API fetch
 * @param {data} response from the GET request
 */
async function drawRectangleFromAPI(data) {
  deleteCapper();

  video = document.getElementsByClassName('video-stream html5-main-video')[0];
  rect = video.getBoundingClientRect();
  tmpCanvas = document.createElement('canvas');

  setVars();

  // Set offset using style:
  // Source: https://www.reddit.com/r/learnjavascript/comments/uy3zvd/how_to_set_the_offset_of_an_element_with_vanilla/
  // Source: https://www.javaspring.net/blog/how-to-set-the-offset-in-javascript/
  tmpCanvas.id = "CursorLayer";
  tmpCanvas.style.left = `${x}px`;
  tmpCanvas.style.top = `${y}px`;
  tmpCanvas.width = width;
  tmpCanvas.height = height;
  tmpCanvas.style.zIndex = 8; // Do we need this?
  tmpCanvas.style.position = "absolute"; // Do we need this? 
  // canvas.style.border = "1px solid"; // Do we need this? 

  body = document.getElementsByTagName("body")[0];
  body.appendChild(tmpCanvas);

  ctx = tmpCanvas.getContext("2d");
  ctx.fillStyle = "rgba(0, 0, 0, 1)";
  ctx.fillRect(0, 0, width, height);
  return; 
}

/**
 * Clear rectangle, remove the canvas, and set variables to null
 */
function deleteCapper() {
  if (ctx == null) { return; }
  ctx.clearRect(0, 0, width, height);
  body.removeChild(tmpCanvas);
  video = null;
  rect = null;
  tmpCanvas = null;
  x = null;
  y = null;
  width = null;
  height = null;
}

/**
 * To be called for when a user wants to submit an entry
 */
function drawRectangleUsingMouse() {
  // Draw rectangle using click and drag
  // Source: https://jsfiddle.net/eyaylagul/nho08juw/
  video = document.getElementsByClassName('video-stream html5-main-video')[0];
  rect = video.getBoundingClientRect();
  var canvas = document.createElement('canvas');

  canvas.id = "CursorLayer";
  canvas.style.left = `${rect.left}px`;
  canvas.style.top = `${rect.top}px`;
  canvas.width = rect.width;
  canvas.height = rect.height;
  canvas.style.zIndex = 8;
  canvas.style.position = "absolute";

  body = document.getElementsByTagName("body")[0];
  body.appendChild(canvas);

  drawingCtx = canvas.getContext("2d");

  var canvasx = $(canvas).offset().left - window.pageXOffset;
  var canvasy = $(canvas).offset().top - window.pageYOffset;
  var last_mousex = last_mousey = 0;
  var mousex = mousey = 0;
  var mousedown = false;

  $(canvas).on('mousedown', function(e) {
    last_mousex = parseInt(e.clientX-canvasx);
    last_mousey = parseInt(e.clientY-canvasy);
    mousedown = true;
  });

  // TODO: Right now, we assume the user will be satisfied with the rectangle upon lifting the mouse
  // This gives the user now chance to adjust or fix the rectangle
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
 * @return {Int}    x       Location of the upper-left corner of the rectangle along x-axis
 * @return {Int}    y       Location of the upper-left corner of the rectangle along y-axis
 * @return {Int}    length  Length of the rectangle, in pixels
 * @return {Int}    height  height of the rectangle, in pixels
 */
async function sendCapper(canvas, ctx, x, y, length, height) {
  video = document.getElementsByClassName('video-stream html5-main-video')[0];
  rect = video.getBoundingClientRect();
  ctx.clearRect(0,0,canvas.width,canvas.height); 
  body.removeChild(canvas);

  x_resolution = rect.width;
  y_resolution = rect.height;

  var video_id = extractYouTubeID(window.location.href);
  buildPostJson(video_id, x_cord, heigh, length, x_resolution, y_resolution);

// a POST request
  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(postJson)
  })
}

function buildPostJson(video_id, x_cord, heigh, length, x_resolution, y_resolution) {
  var tmpJson = {};
  tmpJson.video_id = video_id;
  tmpJson.x_cord = x;
  tmpJson.y_cord = y;
  tmpJson.height = height;
  tmpJson.length = length;
  tmpJson.x_res = x_resolution;
  tmpJson.y_res = y_resolution;
  return tmpJson;
}

async function analyzePage() {
  drawRectangleUsingMouse();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "block") {
    sendResponse(analyzePage());
  }
});
