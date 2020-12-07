var UnixZero = -1;
var mouselog = new Array();
var keyboardlog = new Array();

var fs = require("fs")

function startTimer(){
    let dateTime = Date.now();
    UnixZero = dateTime;
    console.log("restart:", dateTime);
    record("test", "test");
}

function initialization(){
    startTimer();
    mouselog = new Array();
    keyboardlog = new Array();
    keyboardlog.push({"timestamp": UnixZero, "type": "start"});
    mouselog.push({"timestamp": UnixZero, "type": "start"});
}

// Keyboard Operations logger
$(document).keyup(function(evt) {
    if (UnixZero == -1) {
        initialization();
    }
    t = evt.timeStamp;
    //console.log(t);
    keyboardlog.push({"timestamp": t-UnixZero, "type":"type", "keycode": evt.which })
});

// Mouse Movement logger
$(document).mousemove(function(evt) {
    if (UnixZero == -1) {
        initialization();
    }
    t = evt.timeStamp;
    mouselog.push({"timestamp":t-UnixZero, "type":"move", "x":evt.pageX, "y":evt.pageY});
});

$(document).mousedown(function(evt) {
    if (UnixZero == -1) {
        initialization();
    }
    t = evt.timeStamp;
    mouselog.push({"timestamp":t-UnixZero, "type":"click", "x":evt.pageX, "y":evt.pageY});
});

function reportKeyboardLog() {
    if (UnixZero == -1) {return}
    let now = Date.now();
    if (keyboardlog.length > 0){
        output = JSON.stringify(keyboardlog)
        fps = (keyboardlog.length)/((now-UnixZero) / 1000); // ms -> s
        console.log("Type Speed ≈" + fps.toFixed(2) + " letters per second");
    }
    download(output,"keyboard.json");
}

function reportMouseLog() {
    if (UnixZero == -1) {return}
    if (mouselog.length > 0){
        output = JSON.stringify(mouselog)
        download(output,"mouse.json");
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

function record(text, filename) {
    console.log("准备写入文件");
    fs.writeFile('filename.txt', '我是通 过fs.writeFile 写入文件的内容',  function(err) {
        if (err) {
            return console.error(err);
        }
        console.log("数据写入成功！");
        console.log("--------我是分割线-------------")
        console.log("读取写入的数据！");
        fs.readFile('input.txt', function (err, data) {
            if (err) {
                return console.error(err);
            }
            console.log("异步读取文件数据: " + data.toString());
        });
    });
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