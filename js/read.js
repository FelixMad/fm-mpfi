window.baseUrl = 'http://www.felixmad.es';
var s = document.createElement('script');
s.setAttribute('type', 'text/javascript');
s.setAttribute('charset', 'UTF-8');
s.setAttribute('src', baseUrl + '/js/jquery-last.js');
document.documentElement.appendChild(s);


$("<div id='exit'></div>").appendTo("body");
var str = $(".lyricbox").html();
str = str.replace(/\<!--/,"").replace(/--\>/,"");
$(str).clone().appendTo('#exit');
$("#exit div, #exit p").remove();

strSend = $("#exit").html().replace(/<br>/g,"%5Cn");

window.open("http://mpfi:36/mpfi/"+location.search+"&lyrics="+strSend, "mpfi");
window.close();
