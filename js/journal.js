var num = 0;
var write = document.getElementById('write');
var popup = document.getElementById('popup');
var weather = document.getElementById('weather');
var footer = document.getElementById('clear_footer')
var $highlights = $('.highlights');
var $backdrop = $('.backdrop');
var num_highlights = 0;
var modal = document.getElementById("myModal");
var close = document.getElementsByClassName("close")[0]


var key, flag = 0;
var curr_index = 0;
var brcounter = 0;

// Page Onload Operation
write.onscroll = function() {
    var scrollTop = $('textarea').scrollTop();
    $backdrop.scrollTop(scrollTop);
    console.log("ScrollTop");
}

// 调用浏览器本地存储
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
function applyHighlights(text, valence, clss, cats, subject) {
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
            edits = edits.substring(0, cut) + "<und_pos id=" + (h_id) +" style='pointer-events:auto' onclick='showTags(" + num_highlights + ")'>" + edits.substring(cut, cut + len) + "</und_pos>" + edits.substring(cut+len);
        });
        //edits = "<markpos id=" + (h_id) +" style='pointer-events:auto' onclick='showTags(" + num_highlights + ")'>" + edits + "</markpos>";
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
            edits = edits.substring(0, cut) + "<und_neg id=" + (h_id) +" style='pointer-events:auto' onclick='showTags(" + num_highlights + ")'>" + edits.substring(cut, cut + len) + "</und_neg>" + edits.substring(cut+len);
        });
        //edits = "<markneg id=" + (h_id) +" style='pointer-events:auto' onclick='showTags(" + num_highlights + ")'>" + edits + "</markneg>";
        document.getElementById("popup").innerHTML = subject;
        footerPopup(cats, num_highlights);
    }

    console.log("class: " + clss);
    if (clss == "spl") { 
        edits = "<markspl>" + edits + "</markspl>";}
    else if (clss == "sld") { 
        edits = "<marksld>" + edits + "</marksld>";}
    else if (clss == "frt") { 
        edits = "<markfrt>" + edits + "</markfrt>";}
    else if (clss == "blm") { 
        edits = "<markblm>" + edits + "</markblm>";}
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
    if (popup.style.display == "block") { popup.style.display = "none"; return; }
    // while (footer.firstChild) { 
    //     if (footer.firstChild.style.display == "block"){footer.firstChild.style.display == "none"}
    // }
    console.log("click!");
    modal.style.display = "none";
    
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
    
    // First, find start point by skipping <mark***> (numsent_slc + 1) times
    // If numsent_slc == 0, then start no need to skip
    if (numsent_slc >= numsent_ht) { return;}
    else {
        var i, j;
        var sl_counter = 0;
        //console.log("Currhtml ", currhtml);
        //console.log("numsent_slc ", numsent_slc)
        
        if (numsent_slc == 0) {j = 0;}
        else {
            for (i = 0; i < currhtml.length; i++) {
                if (currhtml[i] == "<" && currhtml.slice(i+1, i+5) == "mark") {sl_counter++;console.log("sl_counter =",sl_counter)}
                if (sl_counter == (numsent_slc+1)) {
                    j = i + 8;
                    sl_counter = 0;
                    break;
                }
            }
        }
        //console.log(" j = ",j ," currhtml[i] = ", currhtml.slice(j));
    // Then, find highlight label by looping from this index point
        for (i = j; j < currhtml.length; j++) {
            if (currhtml[j] == "<" && currhtml[j+2] == "m"){
                var label = currhtml.slice(j+2, j+9);
                //console.log(label)
                if (label == "markspl") { 
                    popup.innerHTML = "This is an example of splitting";
                    
                    negPopup("markspl"); return; }
                else if (label == "marksld") { 
                    popup.innerHTML = "Try not to use should statements";
                    negPopup("marksld"); return; }
                else if (label == "markfrt") { 
                    popup.innerHTML = "You're predicting the future";
                    negPopup("markfrt"); return; }
                if (label == "markblm") { 
                    popup.innerHTML = "Try not to assign blame";
                    negPopup("markblm"); return; }
                if (label == "marknut") {
                    continue;}
                else { return; }
            }
            //else if(currhtml[i] == "<") { return; }   
            // YIFAN 12/07/19 11:30 Note: Don't know what's the function of above line, but it cause loop to end too soon, and then, cause no popup display
        }
    }
}

write.ondblclick = function() {
    console.log("double-click!");
    document.getElementById("write").style.pointerEvents = "none";
}

function negPopup(cog_dist) {
    // popup.style.display = "block";
    var cd, color, def, ex1, ex2, ex3;
    switch(cog_dist) {
        case "markspl":
            cd = "Splitting";
            color = "#e2c0c0";
            def="All-or-nothing thinking, or a.k.a. black-or-white thinking, can blind your understanding of a situation for all its positives and negatives. Try to reframe your thoughts more holistically or objectively.";
            ex1="<p><span class='strikethrough'>I'm never going find another oppurtunity like that again.</span> &#x27F6 I missed out on a really good opportunity for a variety of valid reasons; however, when one door closes, another door opens.</p>";
            break;
        case "marksld":
            cd = "Using \"Should\" Statements";
            color = "#dcb1e5";
            def="Thoughts that include \"should,\" \"ought,\" or \"must\" may induce feelings of guilt or shame. Such thoughts can lead you to feel frustration, anger, and bitterness when you or others around you fail to meet the unrealistic expectations you've laid out. Try to set realistic expections for yourself and others and be forgiving if some expections are not met. ";
            ex1="<p><span class='strikethrough'>I should lose weight to be more attractive.</span> &#x27F6 I want to adopt healthier lifestyle habits to improve my body confidence.</p>";
            break;
        case "markfrt":
            cd = "Fortune-telling";
            color = "#dee5b1";
            def="Arbitrarily predicting that things will turn out poorly may cause you to avoid doing something necessary but difficult as a result. Try to avoid determining a possible event as the certain future.";
            ex1="<p><span class='strikethrough'>I know I won't get the job, so I'm just not going to practice for the interview.</span> &#x27F6 I cannot be certain whether or not I will get the job, but I want to do my best to prepare.</p>";
            break;
        case "markblm":
            cd = "Blaming";
            color = "#b1d1e5";
            def="Putting all the blame on someone or something else may cloud your ability to accept your responsilibty in a situation. Try to view the situation from an outside perspective and understand both your's and the other party's circumstances.";
            ex1="<p><span class='strikethrough'>It was all because of my brother's loud singing that I couldn't study for the exam.</span> &#x27F6 I could have gone to the library to allow myself a quieter environment for concentration. </p>";            
            break;
    }
    document.getElementById("cog_dist").innerHTML = cd;
    document.getElementById("cog_dist").style.backgroundColor = color;
    document.getElementById("cd_def").innerHTML = def;
    document.getElementById("ex1").innerHTML = ex1;
    // document.getElementById("ex2").innerHTML = ex2;
    // document.getElementById("ex3").innerHTML = ex3;
    modal.style.display = "block";
}

function footerPopup(tags, num) {
    for (i = 1; i <= num_highlights-1; i++)
    {
        tag = document.getElementById('t_'+i);
        if (tag != null){
            if (tag.style.display == "block") {tag.style.display = "none";}
            console.log(tag.style.display);
        }
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
                    if (currhtml[i] == "m" && currhtml[i-1] == "<" || i == 0) {
                        if (currhtml[i-2] == " ") {
                            currhtml = currhtml.slice(0, i-2);
                        }
                        else {
                            currhtml = currhtml.slice(0, i-1);
                        }

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
            var eliza = resparse["eliza"];
            console.log(cats);
            console.log(und);

            var slice = text.slice(resparse["start"],resparse["end"]);
            var highlightedText = applyHighlights(slice, resparse["valence"], resparse["class"], cats, und);
            console.log("hT" + highlightedText);
            if ($highlights.html() == "") {$highlights.html($highlights.html() + highlightedText);}
            else if (brcounter > 0) {brcounter = 0; $highlights.html($highlights.html() + highlightedText);}    // if LF, no extra space is needed.
            else {$highlights.html($highlights.html() + " " + highlightedText);}
        }

        else if (text[text.length - 1] == " " && (text[text.length - 2] == "." || text[text.length - 2] == "?" || text[text.length - 2] == "!")) {
            var result = runPyScript(text);
            console.log("result" + result)
            var resparse = JSON.parse(result); 
            console.log(resparse);

            var cats = resparse["cats"];
            var und = resparse["und"];
            var eliza = resparse["eliza"];
            console.log(cats);
            console.log(und);

            var i;
            for (i = currhtml.length - 1; i >= 0; i--) {
                if (currhtml[i] == "/") {
                    var label = currhtml.slice(i+1, i+8);
                    $highlights.html($highlights.html() + " <marktmp>" + eliza + "</marktmp>");
                    flag = 1;
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

function enable_click() {
    console.log('click enabled!');
    document.getElementById("write").style.pointerEvents = "auto";
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

    var footer = document.getElementById("clear_footer");
	while (footer.firstChild) footer.removeChild(footer.firstChild);
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

// Weather display, TODO: new rating algorithm
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

close.onclick = function() {
    modal.style.display = "none";
}

// init socket on client side
var socket = io();
var cm;
socket.on('doc', function(data) {
    cm = CodeMirror.fromTextArea(document.getElementById('write'), {lineNumbers: true});
    cm.setValue(data.str);
    var serverAdapter = new ot.SocketIOAdapter(socket);
    var editorAdapter = new ot.CodeMirrorAdapter(cm);   // 用于两端文档输入同步，协同
    var client = new ot.EditorClient(data.revision, data.clients, serverAdapter, editorAdapter);
})

// Utilities
function getFirstCoor(command, tag) {
    let bias = tag.length + 1;
    let start = bias+1;
    let comma = command.indexOf(",",start);
    let end = command.indexOf(")",comma)
    let _line = parseInt(command.substring(start,comma+1));
    let _char = parseInt(command.substring(comma+1,end));
    return {line: _line, ch: _char}
}

function getSecondCoor(command, tag) {
    let bias = tag.length + 1;
    let start = command.indexOf(")",bias) + 3;
    let comma = command.indexOf(",",start);
    let end = command.indexOf(")",comma)
    let _line = parseInt(command.substring(start,comma));
    let _char = parseInt(command.substring(comma+1,end));
    console.log("2nd:", start, comma, end)
    return {line: _line, ch: _char}
}

// Handle received Expert Command from server.js
socket.on("sendToClient", command => {  
    console.log(command);
    handleCommand(command.command);
});

function handleCommand(command){
    console.log(command)
    if (command.indexOf("HighLt:") == 0){   // Highlight
        let from = getFirstCoor(command, "HighLt")
        let to = getSecondCoor(command, "HighLt")
        cm.markText(from, to, {className: "styled-background"})
    }
    else if (command.indexOf("AutoSug:") == 0) {    // Auto Suggesting
        let start = getFirstCoor(command, "AutoSug");
        let end = getSecondCoor(command, "AutoSug");
        cm.markText(start, end, {className: "AutoSuggest-font"})
    }
    else if (command.indexOf("On:Keyboard") == 0) { // Keyboard Log
        $('#keyboardlog').trigger("click");
    }
    else if (command.indexOf("On:Mouse") == 0) {    // Mouse Log
        reportMouseLog();
    }
}
// Demo: How to get text from CodeMirror
function fetch(){
    var text = cm.getValue();
    console.log("Socket:",text);
}