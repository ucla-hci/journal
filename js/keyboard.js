var num = 0;
var write = document.getElementById('write');
var $highlights = $('.highlights');
var $backdrop = $('.backdrop');
var key;

function testFunc() {
    console.log("test");
}

function applyHighlights(text, valence) {
    var edits = text;
    if (valence == "pos") {edits = "<markpos>" + edits + "</markpos>";}
    else if (valence == "neg") {edits = "<markneg>" + edits + "</markneg>";}
    return edits;
}

function runPyScript(input){
    var jqXHR = $.ajax({
        type: "POST",
        url: "http://localhost:5000/login",
        async: false,
        data: { mydata: input }
    });

    return jqXHR.responseText;
}

write.onclick = function(event){
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
            if (currhtml[i] == "<") {
                var label = currhtml.slice(i+2, currhtml.length-1);

                if (label == "markneg"){ negPopup(); return; }
                else { return; }
            }
        }
    }
}

function negPopup() {
    console.log("popup trigger")
}

write.onkeydown = function(event) {
    key = event.keyCode;
}

write.oninput = function() {
    if (key == 8 || key == 46) {
        var currhtml = $highlights.html();
        currhtml = String(currhtml);

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

            if (resparse["valence"] == "neg") {
                var slice = text.slice(resparse["start"],resparse["end"]);
                var highlightedText = applyHighlights(slice, resparse["valence"]);
                if ($highlights.html() == "") {$highlights.html($highlights.html() + highlightedText);}
                else {$highlights.html($highlights.html() + " " + highlightedText);}
            } 
            else if (resparse["valence"] == "pos") {
                var slice = text.slice(resparse["start"],resparse["end"]);
                var highlightedText = applyHighlights(slice, resparse["valence"]);
                if ($highlights.html() == "") {$highlights.html($highlights.html() + highlightedText);}
                else {$highlights.html($highlights.html() + " " + highlightedText);}
            } 
        }
    }
}

write.onscroll = function() {
    var scrollTop = write.scrollTop;
    $backdrop.scrollTop(scrollTop);
}
