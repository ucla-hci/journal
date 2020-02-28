var tZero = 0;
var mouselog = new Array();
var keyboardlog = new Array();

// Keyboard Operations logger
$(document).keyup(function(evt) {
    t = evt.timeStamp;
    if (tZero == 0) {
        tZero = t;
        keyboardlog.push({"timestamp":t-tZero, "keycode":"Start", "type":"ini"})
    }
    keyboardlog.push({"timestamp":t-tZero, "keycode":evt.which, "type":"click"})
});

// Mouse Movement logger
$(document).mousemove(function(evt) {
    t = evt.timeStamp;
    if (tZero == 0) {
        tZero = t;
        mouselog.push({"timestamp":t-tZero, "x":"Start", "y":"Start", "type":"ini"})
    }
    mouselog.push({"timestamp":t-tZero, "x":evt.pageX, "y":evt.pageY, "type":"move"});
});

$(document).mousedown(function(evt) {
    t = evt.timeStamp;
    if (tZero == 0) {
        tZero = t;
        mouselog.push({"timestamp":t-tZero, "x":"Start", "y":"Start", "type":"ini"})
    }
    mouselog.push({"timestamp":t-tZero, "x":evt.pageX, "y":evt.pageY, "type":"down"});
});

var write = document.getElementById('keyboardlog');
write.onclick = function(evt){
    var log = "";
    if (keyboardlog.length > 0){
        for(var i = 0; i < keyboardlog.length - 1; i++) {
            let line = "t=" + (keyboardlog[i].timestamp/1000).toFixed(2) + ":" + keyboardlog[i].keycode;
            log += line + "\r";
        }
        fps = (keyboardlog.length)/(evt.timeStamp-tZero)*1000;
        console.log("Type Speed ≈" + fps.toFixed(2) + " letters per second");
    }
    download(log,"keyboard.txt");
}

function reportMouseLog() {
    var log = "";
    if (mouselog.length > 0){
        for(var i = 0; i < mouselog.length - 1; i++) {
            let line = "t=" + mouselog[i].timestamp.toFixed(5) + " : (" + mouselog[i].x + "," + mouselog[i].y+"), " + mouselog[i].type;
            log += line + "\r";
        }
        download(log,"mouse.txt");
        mouseHeatmap(mouselog);
    }
}

function mouseHeatmap(mouseCoor){
    var canvas = document.getElementById("heatmap");
    canvas.style.display = "block";
    canvas.innerHTML = "";
    canvas.onclick = function(){
        canvas.style.display = "none";
    }

    for(var i = 0; i < mouselog.length - 1; ++i) {
        xCoor = mouseCoor[i].x;
        yCoor = mouseCoor[i].y;
        type = mouseCoor[i].type;
        if (typeof(xCoor) == "number" && typeof(yCoor) == "number") {
            let d = document.createElement("div");

            if (type=="move"){
                d.style.width="5px";
                d.style.height="5px";
                d.style.background="red";
                d.style.borderRadius="50%";
                d.style.position="absolute";
            }
            else if (type=="down"){
                d.style.width="15px";
                d.style.height="15px";
                d.style.background="blue";
                d.style.borderRadius="50%";
                d.style.position="absolute";
            }
            canvas.appendChild(d);
            d.style.left = xCoor + "px";
            d.style.top = yCoor  + "px";
        }
    }
}


// Save Textarea Contents to .txt File
// Ref: https://stackoverflow.com/questions/21479107/saving-html5-textarea-contents-to-file/30740104
function download(text, filename){
    text = text.replace(/\n/g, "\r\n"); // To retain the Line breaks.
    var blob = new Blob([text], { type: "text/plain"});
    var anchor = document.createElement("a");
    anchor.download = filename;
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target ="_blank";
    anchor.style.display = "none"; // just to be safe!
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }