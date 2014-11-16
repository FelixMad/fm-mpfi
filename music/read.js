window.baseUrl = 'http://www.felixmad.es';
window.readabilityToken = '6p8VQ6VqJFYRJF3tNQCVjVgsPfKUn8dcRuHGWCf7';
var s = document.createElement('script');
s.setAttribute('type', 'text/javascript');
s.setAttribute('charset', 'UTF-8');
s.setAttribute('src', baseUrl + '/js/jquery-last.js');
document.documentElement.appendChild(s);

//$("<form method='post' action='envio.php' id='form'><textarea id='textareaExit'></textarea></form>").appendTo("body");
//$(".lyricbox").prependTo("#textareaExit");

//$("#textareaExit .rtMatcher").remove();

$(".lyricbox .rtMatcher").remove();
$(".lyricbox .lyricsbreak").remove();


var str = $(".lyricbox").html().replace(/<br>/g,"\n").replace(/<!--/,"").replace(/-->/,"");

//$(str).$("p").remove();

//str = $(".lyricbox").text();



console.log(str);

//window.open("http://mpfi:36/mpfi/", "otro");

$('#form').submit(function(){
	alert();
	$.ajax({
		type: 'POST',
		url: $(this).attr('action'),
		dataType: 'json',
		data: json,
		contentType: 'application/json; charset=utf-8',
		success: function(data){
			alert(data);
		}
	})
	return false;
});