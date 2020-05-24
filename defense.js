var context = document.getElementById('defense').getContext('2d');

var tileSize = 60;
var tile = 1;

var clickLoc = new Object;
clickLoc.x = 0;
clickLoc.y = 0;

var emptyLoc = new Object;
emptyLoc.x = 0;
emptyLoc.y = 0;

// defenseImages is the state of the defense with the images for each tile
// defenseImages[0] is the map
// defenseImages[1..48] are the buildings/units at that tile #
var defenseImages = Array(49).fill('');

// loadedImages is a hashmap of image_url:img object
var loadedImages = {};

window.onload = function() {
  setDefaults();
  drawDefense();
};

document.getElementById('defense').onclick = function(e) {
  // TODO - Maybe convert to alternate coords system
  clickLoc.x = Math.floor((e.pageX - this.offsetLeft) / tileSize);
  clickLoc.y = Math.floor((e.pageY - this.offsetTop) / tileSize);

  tile = clickLoc.x + (clickLoc.y * 6) + 1
  console.log("Tile clicked: " + tile);
  document.getElementById("selected").innerHTML = tile.toString();
  $('#occupied').val(defenseImages[tile]).trigger('change');
  //document.getElementById("occupied").value = defenseImages[tile];
};

function download() {
  // DOES NOT WORK
  // Insecure operation...may need to deal with CORS when loading images...

  var download = document.getElementById("download");
  //var image = document.getElementById("defense").toDataURL("image/png").replace("image/png", "image/octet-stream");
  //download.setAttribute("href", image);

  var canvas = document.getElementById("defense");
  var img    = canvas.toDataURL("image/png");
  document.write('<img src="'+img+'"/>');
}


function boxChecked(){
  drawDefense();
}

function setTerrain(){
  defenseImages[0] = document.getElementById("terrain").value;
  drawDefense();
}

function setOccupied(){
  defenseImages[tile] = document.getElementById("occupied").value;
  drawDefense();
}


// Initialize the map
function setDefaults(){
  document.getElementById("selected").innerHTML = tile;
  defenseImages[0] = 'assets/terrain/springwater.png';
  defenseImages[1] = 'assets/buildings/fountain.png';
  defenseImages[6] = 'assets/buildings/pots.png';
  defenseImages[20] = 'assets/buildings/fortress.png';
  $('#terrain').val(defenseImages[0]).trigger('change');
  $('#occupied').val(defenseImages[tile]).trigger('change');
}

// Preload all images using promises
function loadAndDraw() {
  // Create array of promises for each image we need to load
  var promiseArray = defenseImages.map(function(imgurl){
    var prom = new Promise(function(resolve,reject){
      // Skip blank spaces
      if (imgurl == '') {
        resolve();
        return;
      }

      var img = new Image();
      img.onload = function(){
        // Store the loaded image using the image location as the key
        loadedImages[imgurl] = img;
        resolve();
      };
       img.src = imgurl;
    });
    return prom;
  });

  // When all the promises are loaded, start drawing
  Promise.all(promiseArray).then(imagesLoaded);
}

function imagesLoaded(){
  // Draw terrain
  // Fill background to clear old image
  // Use blue for water/sky, or orange for lava
  context.fillStyle = "#0066FF";
  if(defenseImages[0] == "assets/terrain/lava_floes.png"){
    context.fillStyle = "#FF9900";
  }

  context.fillRect(0, 0, 360, 360);
  context.drawImage(loadedImages[defenseImages[0]], 0, 0);

  // Draw coords
  // NOTE: Consider moving coords below the tiles...?
  if (document.getElementById("coords").checked){
    drawLocations()
  }

  // Draw tiles
  for (i=1;i<=48;i++){
    if (defenseImages[i] == ''){continue;};

    var x = 60 * ((i-1) % 6);
    var y = 60 * Math.floor((i-1) / 6);
    context.drawImage(loadedImages[defenseImages[i]], x, y, 60, 60);
  }

  // Draw grid
  if (document.getElementById("grid").checked){
    drawGrid()
  }
  // Draw coords
  // NOTE: Consider moving coords below the tiles...?
  //if (document.getElementById("coords").checked){
  //  drawLocations()
  //}

  // Draw creds box to cover the offense building row
  drawCreds()
}

function drawDefense() {
  // Simple redirect function
  loadAndDraw()
}


function drawLocations(){
  // TODO - Reverse #s to match AI guide?
  // See https://vervefeh.github.io/FEH-AI/glossary.html#section1b
  var i, x, y;

  // Set various fonts/aligns/styles/colors
  context.textAlign = "center";
  context.fillStyle = "rgba(0, 0, 0, 0.25)";
  context.font='bold 30px Arial';
  context.miterLimit = 2;
  context.lineJoin = 'circle';
  context.strokeStyle = 'black';
  context.lineWidth = 1;

  for (i = 1; i <= 48; i++) {
    x = getX(i)
    y = getY(i)

    // Draw outline of the number and transparent fill
    context.strokeText(i.toString(), (x*60)-30, (y*60)-20);
    context.fillText(i.toString(), (x*60)-30, (y*60)-20);

  }
}

function drawGrid(){
  // Draw black lines to show the grid
  context.strokeStyle = 'black';
  context.fillStyle = "rgba(0, 0, 0, 1)";

  // Vertical Lines
  for (i=0;i<6;i++){
    context.beginPath();
    context.moveTo(i*60, 0);
    context.lineTo(i*60, 60*8);
    context.stroke();
  }

  // Horizontal Lines
  for (i=0;i<8;i++){
    context.beginPath();
    context.moveTo(0, i*60);
    context.lineTo(60*6, i*60);
    context.stroke();
  }
}

function drawCreds(){
  // Draw over the offense building row
  context.fillStyle = "#407480";
  context.fillRect(0, 60*7, 60*6, 60*8);

  // Put website name
  context.textAlign = "center";
  context.font='bold 32px Arial';
  context.fillStyle = "rgba(0, 0, 0, 1)";
  //context.fillText("https://skullkid2424.github.io/", 60*3, 60*7+38);
  context.fillText("skullkid2424.github.io", 60*3, 60*7+38);
}


function getX(t){
  return (parseInt(t, 10)-1) % 6 + 1;
}
function getY(t){
  return Math.floor((parseInt(t, 10)-1) / 6) + 1;
}

function distance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
