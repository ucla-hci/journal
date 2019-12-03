var num = 0;
var write = document.getElementById('write');
var popup = document.getElementById('popup');
var $highlights = $('.highlights');
var $backdrop = $('.backdrop');

var key, flag = 0;
var index = 1;
var brcounter = 0;

function applyHighlights(text, valence) {
    var edits = text;
    if (valence == "pos") {edits = "<markpos>" + edits + "</markpos>";}
    else if (valence == "neg") {edits = "<markneg>" + edits + "</markneg>";}
    else { edits = "<marknut>" + edits + "</marknut>";} 
    
    return edits;
}

function runPyScript(input){
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/login",
        async: false,
        data: { mydata: input }
    });

    return jqXHR.responseText;
}

write.onclick = function(){
    if (popup.style.display == "block") { popup.style.display = "none"; return; }

    var curpos = write.selectionStart;
    var currhtml = $highlights.html();
    currhtml = String(currhtml);

    var slc = write.value.slice(0, curpos);
    var numsent_slc = (slc.match(/\./g)||[]).length;
    var numsent_ht = (currhtml.match(/\./g)||[]).length;
    if (numsent_slc >= numsent_ht) { return; }
    else {
        var i;
        for (i = curpos + (numsent_slc * 19) + 9; i < currhtml.length; i++) {
            if (currhtml[i] == "<" && currhtml[i+1] == "/") {
                var label = currhtml.slice(i+2, i+9);

                if (label == "markneg"){ negPopup(); return; }
                else { return; }
            }
            else if(currhtml[i] == "<") { return; }
        }
    }
}

function negPopup() {
    popup.style.display = "block";
}

write.onkeydown = function(event) {
    key = event.keyCode;
    //console.log(key)
}

// Process input text.
write.oninput = function() {
    var currhtml = $highlights.html();
    currhtml = String(currhtml);

    if (flag == 1) {
        flag = 0;
        var n = currhtml.indexOf(" <marktmp>");
        $highlights.html(currhtml.slice(0, n));
    }

    if (key == 13){    // Enter
        $highlights.html($highlights.html() + "<marknut><br></marknut>");
        brcounter += 1;
    }
    else if (key == 8 || key == 46) {    // Delete or Backspace
        var numsent_wr = (write.value.match(/\./g)||[]).length;
        var numsent_ht = (currhtml.match(/\./g)||[]).length;

        if (numsent_ht > numsent_wr) { 
            if (currhtml[currhtml.length - 1] == ">") {
                var i;
                for (i = currhtml.length - 1; i >= 0; i--) {
                    if (currhtml[i] == "<" && currhtml[i-1] == " " || i == 0) {
                        currhtml = currhtml.slice(0, i - 1);
    
                        $highlights.html(currhtml);
                        if (i==0) { $highlights.html(""); }
                        break;
                    } 
                }
            }
        }
        return;
    }
    else {
        var text = write.value;
        if (text[text.length - 1] == ".") {
            var result = runPyScript(text);
            var resparse = JSON.parse(result); 

            var slice = text.slice(resparse["start"],resparse["end"]);
            var highlightedText = applyHighlights(slice, resparse["valence"]);
            if ($highlights.html() == "") {$highlights.html($highlights.html() + highlightedText);}
            else if (brcounter > 0) {$highlights.html($highlights.html() + highlightedText); brcounter = 0;}
            else {$highlights.html($highlights.html() + " " + highlightedText);}
        }

        else if (text[text.length - 1] == " " && text[text.length - 2] == ".") {
            var i;
            for (i = currhtml.length - 1; i >= 0; i--) {
                if (currhtml[i] == "/") {
                    var label = currhtml.slice(i+1, i+8);
                    if (label == "markneg") {
                        $highlights.html($highlights.html() + " <marktmp>Try reframing that negative thought.</marktmp>");
                        flag = 1;
                    }
                    return;
                }

            }
        }
    }
}

write.onscroll = function() {
    var scrollTop = $('textarea').scrollTop();
    $backdrop.scrollTop(scrollTop);
    console.log("ScrollTop");
}

if(window.localStorage["last_index"]){
    index = parseInt(window.localStorage["last_index"]);
    if (!index) {
        index = 1;
    }
}
else{
    window.localStorage["last_index"] = 1;
}
loaddata(index);
document.getElementById("m"+index.toString()).style.background = "#d3d";

function swich(i){
    document.getElementById("m" + index.toString()).style.background = "#a34";
    document.getElementById("m"+i.toString()).style.background = "#d3d";
    savedata_noalert();
    index = i;
    loaddata(index);
    console.log("Switch to ", i);
}

function loaddata(index){
    var name = "data" + index.toString();
    if (window.localStorage[name]){
        document.getElementById("write").value = window.localStorage[name];
    } 
    else{
        document.getElementById("write").value = ""
    }
    console.log("loaddata",name)
}

function savedata(){
    var name = "data" + index.toString();
    console.log("save",name)
    window.localStorage[name] = document.getElementById("write").value;
    window.localStorage["last_index"] = index;
    alert('All Secure!');
}

function cleardata(){
    window.localStorage["withdraw"] = document.getElementById("write").value;
    document.getElementById("write").value = "";
    savedata_noalert();
    $highlights.html("");
}

function withdraw(){
    if(window.localStorage["withdraw"]){
        document.getElementById("write").value = window.localStorage["withdraw"];
    }
    else{
        alert('No input can be withdrawn!');
    }
}

function savedata_noalert(){
    var name = "data" + index.toString();
    window.localStorage[name] = document.getElementById("write").value;
    window.localStorage["last_index"] = index;
}

/*
//code copy from http://stackoverflow.com/questions/1601593/fire-tab-keypress-event-in-javascript
document.getElementById('write').onkeydown = function(e){
    if (e.keyCode == 9) {
        insertAtCursor('    ');
        return false;
    }
}

// code edit from http://jsfiddle.net/Znarkus/Z99mK/
function insertAtCursor(myValue) {
    myField = document.getElementById("write");
    //IE support
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue
            + myField.value.substring(endPos, myField.value.length);
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
    } else {
        myField.value += myValue;
    }
}
*/
function mood(){
    $(".dislog").css("display","block");
}

function left(){
    $(".dislog").css("display","none");
    $highlights.html(" <marktmp>Sorry to hear that. Wanna talk about what happened?</marktmp>");
    flag = 1;
}

function middle(){
    $(".dislog").css("display","none");
    $highlights.html(" <marktmp>Any plan tomorrow?</marktmp>");
    flag = 1;
}

function right(){
    $(".dislog").css("display","none");
    $highlights.html(" <marktmp>Cool! Why not write down those happy moments now?</marktmp>");
    flag = 1;
}