var num = 0;
var write = document.getElementById('write');
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
        url: "http://localhost:5000/login",
        async: false,
        data: { mydata: input }
    });

    return jqXHR.responseText;
}

write.onclick = function(){

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

                if (label == "markneg"){ return; }
                else { return; }
            }
            else if(currhtml[i] == "<") { return; }
        }
    }
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


function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("container").style.marginLeft = "250px";
    document.getElementById("myBottombar").style.left = "250px";
    document.getElementById("opnsidebar").setAttribute("onclick", "closeNav()");
    document.getElementById("opnsidebar").style.backgroundImage = 'url("https://s3-alpha-sig.figma.com/img/8e4a/5d15/330b971d8b10af86ac172c84e9e8107e?Expires=1584316800&Signature=BdIWaFiczqz9G33-pCfGrE9Evi9ME9hotA8voI2yM-zcuwhPlkipopsZHP-N6Kn3pqvuNLarhTRMkEgQ-04eflB3tsVajqJ1nmVtScA6L5PVJxVI~hxzlxgXwYLzmc-vUOK2h~UgW3tQH4g29aU6STPjD4K0g5Ve4PDLmg7cpG7B4hXpbrmzSWtJlzzPgHBrRhJj6ASEAxnJpoMaDzKbMmtKYcoZhINwQel~Q3lHzavAhQMpU5VTnmj4HoIKsqhxhCoXLzl-w06cMxfODfqavWX89DB78rxpeK~dL7-H88dywjaP8t9rurkdAgTXHHytn~7YgtBtOpd-m8qgDAmJww__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA")';
}
  
function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("container").style.marginLeft= "0";
    document.getElementById("myBottombar").style.left = "0px";
    document.getElementById("opnsidebar").setAttribute("onclick", "openNav()");
    document.getElementById("opnsidebar").style.backgroundImage = 'url("https://s3-alpha-sig.figma.com/img/efb8/354e/cdb18b9e0a6419f02808894751f4e152?Expires=1584316800&Signature=gBwhOd6iWhUffH-HuyYT6V02WNx~W~621cBNhsO7~jBr1Qv2HqF13T6ZK4ixyw1YuGygtMvON0TDmSWuKnVFxYss9OSsDUZEXM5DCas0uEEjWpvQA-3rGSqESiG0CVXB~YQEBTVn8wBWzB0ty9reK6~knXX~yZEb9dEGjRiu-RWaXlXAwWjVIivCC6mJgBhkuOtKOyFAivgMO1A~tlZ128XKPYEuzWDXfQI4Xk3JU8R4zkujGGlopMUkiL6hRE3GoGx40AqXmBB3tsesNWslTUc5vyIbHK7PIfknxR42aDSEEQ44PdUNmjmBoQzqHXsUKmpVQeP49e14dwYHI1jpzQ__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA")';
}

function openDef() {
    document.getElementById("myBottombar").style.height = "250px";
    document.getElementById("main").style.marginBottom = "250px";
}
  
function closeDef() {
    document.getElementById("myBottombar").style.height = "0";
    document.getElementById("main").style.marginBottom= "0";
}

function loader() {
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
        content.style.maxHeight = null;
        } else {
        content.style.maxHeight = content.scrollHeight + "px";
        } 
    });
    }
}