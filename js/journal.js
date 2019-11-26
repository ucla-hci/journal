var num = 0;
var write = document.getElementById('textarea');
var popup = document.getElementById('popup');
var $highlights = $('.highlights');
var $backdrop = $('.backdrop');

var key, flag = 0;

function applyHighlights(text, valence) {
    var edits = text;
    if (valence == "pos") {edits = "<markpos>" + edits + "</markpos>";}
    else if (valence == "neg") {edits = "<markneg>" + edits + "</markneg>";}
    else { edits = "<marknut>" + edits + "</marknut>"; }
    
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
}

write.oninput = function() {
    var currhtml = $highlights.html();
    currhtml = String(currhtml);

    if (flag == 1) {
        flag = 0;
        var n = currhtml.indexOf(" <marktmp>");
        $highlights.html(currhtml.slice(0, n));
    }

    if (key == 8 || key == 46) {
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
}
