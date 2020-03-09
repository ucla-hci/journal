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