var num = 0;
var write = document.getElementById('write');
var popup = document.getElementById('popup');
var weather = document.getElementById('weather');
var footer = document.getElementById('clear_footer')
var $highlights = $('.highlights');
var $backdrop = $('.backdrop');
var num_highlights = 0;

var key, flag = 0;
var curr_index = 0;
var brcounter = 0;

// Page Onload Operation
write.onscroll = function() {
    var scrollTop = $('textarea').scrollTop();
    $backdrop.scrollTop(scrollTop);
    console.log("ScrollTop");
}

if(window.localStorage["last_index"]){
    curr_index = parseInt(window.localStorage["last_index"]);
    if (!curr_index) {
        curr_index = 1;
    }
}
else{
    window.localStorage["last_index"] = 1;
}
loaddata(curr_index);
document.getElementById("m"+curr_index.toString()).style.background = "#d3d";

// Front-Back Communication
function runPyScript(input){
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/login",
        async: false,
        data: { mydata: input }
    });
    return jqXHR.responseText;
}

function runPyScript_check(input){
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/check",
        async: false,
        data: { mydata: input }
    });
    return jqXHR.responseText;
}

// Support Functions
function applyHighlights(text, valence, cats, subject) {
    var edits = text;
    var subjects = subject.split(" ");
    console.log(subjects);

    console.log("val" + valence);
    if (valence == "pos") {
        num_highlights++;
        var h_id = 'h_' + num_highlights;
        var t_id = 't_' + num_highlights;
        subjects.forEach(function (sub, i) {
            var cut = edits.search(sub);
            var len = sub.length;
            edits = edits.substring(0, cut) + "<und_pos>" + edits.substring(cut, cut + len) + "</und_pos>" + edits.substring(cut+len);
        });
        edits = "<markpos id=" + (h_id) +" style='pointer-events:auto' onclick='showTags(" + num_highlights + ")'>" + edits + "</markpos>";
        document.getElementById("popup").innerHTML = subject;
        footerPopup(cats, num_highlights);

    }
    else if (valence == "neg") {
        num_highlights++;
        var h_id = 'h_' + num_highlights;
        var t_id = 't_' + num_highlights;
        subjects.forEach(function (sub, i) {
            var cut = edits.search(sub);
            var len = sub.length;
            edits = edits.substring(0, cut) + "<und_neg>" + edits.substring(cut, cut + len) + "</und_neg>" + edits.substring(cut+len);
        });
        edits = "<markneg id=" + (h_id) +" style='pointer-events:auto' onclick='showTags(" + num_highlights + ")'>" + edits + "</markneg>";
        document.getElementById("popup").innerHTML = subject;
        footerPopup(cats, num_highlights);
    }
    else { edits = "<marknut>" + edits + "</marknut>"; }
    
    return edits;
}

function showTags(t_ID)
{
    for (i = 1; i <= num_highlights; i++)
    {
        tag = document.getElementById('t_'+i);
        if (tag.style.display == "block") {tag.style.display = "none";}
    }
    console.log('click tags' + t_ID);
    document.getElementById('t_' + t_ID).style.display = "block";

    document.getElementById("write").style.pointerEvents = "auto";
}

function removeTags(t, ID)
{
    console.log("t_ID");
    var x = document.getElementById(ID.toString()+ t.toString());
    x.parentNode.parentNode.removeChild(x.parentNode);
}


write.onclick = function(){
    // if (popup.style.display == "block") { popup.style.display = "none"; return; }
    // while (footer.firstChild) { 
    //     if (footer.firstChild.style.display == "block"){footer.firstChild.style.display == "none"}
    // }
    console.log("click!");
    
    for (i = 1; i <= num_highlights; i++)
    {
        console.log('hiding t_' + i);
        tag = document.getElementById('t_'+i);
        if (tag.style.display == "block") { tag.style.display = "none"; }
        console.log(tag.style.display);
    }

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
                else if (label == "markpos") { negPopup(); return; }
                else { return; }
            }
            else if(currhtml[i] == "<") { return; }
        }
    }
}

write.ondblclick = function() {
    console.log("double-click!");
    document.getElementById("write").style.pointerEvents = "none";
}

function negPopup() {
    popup.style.display = "block";
}

function footerPopup(tags, num) {
    for (i = 1; i <= num_highlights-1; i++)
    {
        tag = document.getElementById('t_'+i);
        if (tag.style.display == "block") {tag.style.display = "none";}
        console.log(tag.style.display);
    }

    t_id = 't_'+num_highlights;

    var fancy_tags = tags.split(" ");
    var all_tags=""

    var tag_inner = "<div class='w3-container w3-tag w3-round w3-theme-l2' style='padding:3px 5px'><img src = 'https://findicons.com/files/icons/557/creme/128/delete.png' height='15' id="; 
    var tag_mid = " onclick='removeTags(\"";
    var tag_func = ")'><div class='w3-container w3-tag w3-round w3-theme-l2 w3-border w3-border-white'>";
    var tag_end = "</div></div>";

    fancy_tags.forEach(function (tag, i) {
        var id = num.toString() + tag.toString();
        all_tags += tag_inner + id + tag_mid + tag +"\"," + num.toString() + tag_func + tag + tag_end;
    });

    var tagify = "<div id=" + t_id + ">" + all_tags + "</div>";
    document.querySelector('footer').innerHTML += (tagify);
    document.getElementById(t_id).style.display = "none";
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

    if (key == 13){    // LF
        $highlights.html($highlights.html() + "<marknut><br></marknut>");
        brcounter += 1;
    }
    else if (key == 8 || key == 46) {    // Backspace + Delete
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
        if (text[text.length - 1] == "." || text[text.length - 1] == "?" || text[text.length - 1] == "!") {
            var result = runPyScript(text);
            console.log("result" + result)
            var resparse = JSON.parse(result); 
            console.log(resparse);

            var cats = resparse["cats"];
            var und = resparse["und"];
            // var effect = resparse["empath"];
            console.log(cats);
            console.log(und);

            var slice = text.slice(resparse["start"],resparse["end"]);
            var highlightedText = applyHighlights(slice, resparse["valence"], cats, und);
            console.log("hT" + highlightedText);
            if ($highlights.html() == "") {$highlights.html($highlights.html() + highlightedText);}
            else if (brcounter > 0) {brcounter = 0; $highlights.html($highlights.html() + highlightedText);}    // if LF, no extra space is needed.
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

function swich(i){
    document.getElementById("m" + curr_index.toString()).style.background = "#a34";
    document.getElementById("m"+i.toString()).style.background = "#d3d";
    savedata_noalert();
    curr_index = i;
    loaddata(curr_index);
    $highlights.html("");
    console.log("Switch to ", i);
}

function loaddata(index){
    var name = "data" + index.toString();
    if (index == -1){
        name = "data" + curr_index.toString()
    }
    else if (window.localStorage[name]){
        document.getElementById("write").value = window.localStorage[name];
    } 
    else{
        document.getElementById("write").value = ""
    }
    console.log("loaddata",name)
}

function savedata(){
    var name = "data" + curr_index.toString();
    console.log("save",name)
    window.localStorage[name] = document.getElementById("write").value;
    window.localStorage["last_index"] = curr_index;
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
    var name = "data" + curr_index.toString();
    window.localStorage[name] = document.getElementById("write").value;
    window.localStorage["last_index"] = curr_index;
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

function overall(){
    var text = write.value;
    var result = runPyScript_check(text);
    var value = parseFloat(result);
    console.log(value);
    if (value < 0.001) {
        weather.src="./src/1.png";
    }
    else if (value < 0.01) {
        weather.src="./src/2.png";
    }
    else if (value < 0.02) {
        weather.src="./src/3.png";
    }
    else if (value < 0.03) {
        weather.src="./src/4.png";
    }
    else if (value < 0.04) {
        weather.src="./src/5.png";
    }
    else if (value < 0.05) {
        weather.src="./src/6.png";
    }
    else if (value < 0.06) {
        weather.src="./src/7.png";
    }
    else {
        weather.src="./src/8.png";
    }
}

function mood(){
    $(".dislog").css("display","block");
}

function mood_hide(){
    $(".dislog").css("display","none");
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