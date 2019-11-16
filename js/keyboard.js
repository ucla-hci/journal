var num = 0;
var write = document.getElementById('write');
var $highlights = $('.highlights');
var $backdrop = $('.backdrop');

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

write.onkeydown = function(event) {
    if (event.keyCode == 8 || event.keyCode == 46) {
        var currhtml = $highlights.html();
        currhtml = String(currhtml);

        var numsent = (write.value.match(/./g)||[]).length;
        if (currhtml.length < (write.value.length + (numsent*19))) { return; }

        if (currhtml[currhtml.length - 1] == ">") {
            var i, flag = 0;
            for (i = currhtml.length - 1; i >= 0; i--) {   
                if (currhtml[i] == "<") {
                    currhtml = currhtml.slice(0, i);
                    $highlights.html(currhtml);
                    flag = 0;
                }

                if (flag == 1) {continue;}

                if (currhtml[i] == "/") {
                    if (currhtml[i-3] == ">") {flag = 1;}
                    currhtml = currhtml.slice(0, i - 2) + currhtml.slice(i - 1);
                    console.log(currhtml);
                    $highlights.html(currhtml);
                    if (flag == 1) {i++; continue;}
                    break;
                }
                
            }
        }
        else {
            $highlights.html("");
        }
    }
}

write.oninput = function() {
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

write.onscroll = function() {
    var scrollTop = write.scrollTop;
    $backdrop.scrollTop(scrollTop);
}
