var urlXmlItunes;
var fileItunes = "iTunes%20Music%20Library.xml";
var strUserAgent = navigator.userAgent;
var pattMac = /Mac\sOS\sX/g;
var pattWXP = /Windows\sNT\s5.1/g;
var pattW7 = /Windows\sNT\s6.1/g; 

var settingActive = false;
var windowSong = false;
var continuo = 0;
var random = false;
var playSong = false; //boleano de la reproduccion.
var i = 0;
var b; //decimal de indice de reproduccion.
var u = 0;//variable global para los pasos de sincronizacion.
var scrollTopList = 0;
var activeSong;
var activeList;
var nameActiveList; //Nombre de la lista activa.
var parsePlayLists; //Objeto con la lista de reproducción actual.
var dataLyric;//Objeto con letra de la canción actual.
var parseObjectBiblioteca; //Objecto de biblioteca.
var iniScrollLyric;
var playInterval;
var markLyric;

var actualSong;
var stepStep=[];

$(document).ready(function(){
	/*if(window.name != "mpfi") {
		window.open("index.html", "mpfi");
		window.close();
	}*/
	
	if(pattMac.test(strUserAgent)){
		urlXmlItunes = "../../Music/iTunes/"+fileItunes;
	}else if(pattWXP.test(strUserAgent)){
		urlXmlItunes = "../../Mi%20m%C3%BAsica/iTunes/"+fileItunes;
	}else if(pattW7.test(strUserAgent)){
		urlXmlItunes = "../../Mi%20m%C3%BAsica/iTunes/"+fileItunes;
	}
	
	$("body>div").hide();
	eventGlobal();
	elementPrint();
	if(!localStorage.getItem('playLists')){
		alertLibrery();
		$("#readLibrary").show();
		$("#readLibrary div p").html("La aplicacion no tiene datos de la biblioteca de iTunes");
	}else{
		if(localStorage.getItem('activeList')){
			activeList = localStorage.getItem('activeList');
			parsePlayLists = jQuery.parseJSON(localStorage.getItem(activeList));
			playLists = jQuery.parseJSON(localStorage.getItem('playLists'));
			
			if(getQuerystring('lyrics')){
				localStorage.setItem(getQuerystring('PersistentIDSong'), getQuerystring('lyrics').replace(/\"/g,"&quot;").replace(/^/, '[{"line": "').replace(/$/, '"}]').replace(/%5Cn%5Cn/g, "%5Cn").replace(/%20/g, " ").replace(/%5Cn/g, '"},{"line": "'));		
			};
			if(getQuerystring('PersistentIDSong')){
				var cc = 0;
				$(jQuery.parseJSON(localStorage.getItem(localStorage.getItem("activeList")))).each(function(){
					if($(this)[0].PersistentID == getQuerystring('PersistentIDSong')) b = cc;
					cc++;
				});
				windowSong = true;
				playSong = true;
				refresDataSong();
				
			}else{
				switchList();
			};
			printList();
			eventList();
			eventPlay();
			eventSong();
			if(continuo == 1){
				$("audio")[0].play();
				$(this).addClass("play");
				playSong = true;
			}
		}else{
			printLibrery();
			eventLibrery();
			switchLibrery();
		}		
	}
});

var eventGlobal = function(){
	$("button").bind('mousedown', function(){
		$(this).addClass("press");
	});
	$("button").bind('mouseup', function(){
		$(this).removeClass("press");
	});
	
	$(".listado p").bind('mousedown', function(){
		$(this).addClass("fileActive");
	});
	$(".listado p").bind('mouseup', function(){
		$(this).removeClass("fileActive");
	});
	
	$("#bSetting").click(function(){
		if(!settingActive){
			openSettings();
		}else{
			closeSettings();
		}
	});
	
	$("button").bind('mousedown', function(){
		$(this).addClass("press");
	});
	$("button").bind('mouseup', function(){
		$(this).removeClass("press");
	});
		
	$(".listado p").bind('mousedown', function(){
		$(this).addClass("fileActive");
	});
	$(".listado p").bind('mouseup', function(){
		$(this).removeClass("fileActive");
	});
	
}

var elementPrint = function(){
	$("<button id='bRecargarLista'></button>").addClass("ordinary").html("Recargar esta libreria").appendTo("#setting #list");
	$("<button id='volverASincronizar'></button>").addClass("ordinary").html("ReSincronizar").appendTo("#setting #sPlayer");
	$("<button id='bSincronizar'></button>").addClass("primary").html("Sincronizar").appendTo("#setting #sPlayer");
	$("<button id='bStepLine' class='secondary'></button>").html("Paso").appendTo("#setting #sPlayer");
	$("<button id='volverACargar'></button>").addClass("ordinary").html("Volver a meter letra").appendTo("#setting #sPlayer");
	//$("<button>").attr("id","bSaveSong").addClass("primary").html("Guardar").appendTo("#setting #sPlayer");
	$("<button id='bSendLyric' class='secondary'></button>").html("Enviar letra").appendTo("#setting #sPlayer");
	$("<button id='bPonerLetra'></button>").addClass("primary").html("Poner letra").appendTo("#setting #sPlayer");
	$("<button>").addClass("ordinary").attr("id","bRecargarLibreria").html("Recargar libreria").appendTo("#setting #list");
}

var alertLibrery = function(text){
	$("#groupFoot, #footer").hide();
	$("<div>").appendTo("#readLibrary");
	$("<img>").attr("src","image/alert.png").appendTo("#readLibrary>div");
	$("<p>").appendTo("#readLibrary>div");
	$("<button>").attr("id","bloadLibrery").addClass("primary").html("Cargar datos").appendTo("#readLibrary>div");
	$("#bloadLibrery").click(function(){
		loadLibrery();
		//$("#readLibrary").hide();
	});
	$("#readLibrary").addClass("window centerWidth centerHeight").show();
}

function loadLibrery(){
	$('#loading').ajaxStart(function(){
		$("#playList").hide();
		$(this).show();
	}).ajaxStop(function(){
		$(this).hide();
	});
	
	$.ajax({
		type: "GET",
		//url: "file:///Users/josefelixgarridoochoa/Music/iTunes/iTunes%20Music%20Library.xml",
		url: "http://itunes/iTunes%20Music%20Library.xml",
		//url: "../iTunes%20Music%20Library.xml", //fileItunes,//urlXmlItunes,
		dataType: "xml",
		success: function(xml){
			$("#readLibrary").hide();
			var i = 0;
			var playlistsPID = [];
			$(xml).find("plist dict dict key:contains('Playlist Persistent ID')").parent().each(function(){
				var playlistPersistentID = $(this).find("key:contains('Playlist Persistent ID')").next().text();
				var playlistName = $(this).find("key:contains('Name')").next().text();
				playlistsPID[i] = {'PersistentID':playlistPersistentID, 'name': playlistName };
				i++;
			});
			localStorage.setItem('playLists', JSON.stringify(playlistsPID));
			window.location.reload();
		},
		error: function(jqXHR, textStatus, errorThrown){
			alert(textStatus+" "+textStatus+" "+errorThrown);
			$("#readLibrary").show();
			$("#readLibrary div p").html("error de conexión");
		},
	});		
}

var switchLibrery = function(){
	$("#botoneraPlayer button").removeClass("activo").addClass("inactivo");
	$("#setting button, body>div").hide();
	$("#playList, #bRecargarLibreria, #groupFoot, #footer, #bRecargarLibreria").show();
	$("#botoneraPlayer button").removeClass("activo").addClass("inactivo");
	$("#playList .listado").scrollTop((($(".active").index(".listado p")) - parseInt(($(".listado").height()/26)/2))*26);
	
}

var printLibrery = function(){
	$("#playList .listado p").remove();
	var i = 0;
	parseObjectBiblioteca = jQuery.parseJSON(localStorage.getItem('playLists'));
	$(parseObjectBiblioteca).each(function(){
		$("<p><span>"+parseObjectBiblioteca[i].name+"</span></p>").appendTo("#playList .listado");
		if(parseObjectBiblioteca[i].PersistentID == localStorage.getItem('activeList')) $("#playList .listado p").eq(i).addClass("active");
		i++;
	});
	$("<span>").addClass("arrowMore").appendTo("#playList .listado p");
}

var eventLibrery = function(){
	$("#bRecargarLibreria").click(function(){
		$("#setting #list").remove();
		if(settingActive)closeSettings();
		localStorage.removeItem('playLists');
		setTimeout(function(){
			loadLibrery();
		},300);
	});
		
	$("#playList .listado p").click(function(){
		if(settingActive)closeSettings();
		activeList = parseObjectBiblioteca[$(this).index()].PersistentID;
		nameActiveList = parseObjectBiblioteca[$(this).index()].name;
		$("#playList .listado p").removeClass();
		$(this).addClass("active");
		if(!localStorage.getItem(activeList)){
			loadList();
		}else{
			if(localStorage.getItem('activeList') != parseObjectBiblioteca[$(this).index()].PersistentID){
				localStorage.setItem('activeList', activeList);
				window.location.reload();
			}else{
				switchList();
				$("#listSong .listado").scrollTop((b - parseInt(($("#listSong .listado").height()/26)/2))*26);
			}
		}
		
	});
}

var loadList = function(){
	$('#loading').ajaxStart(function(){
		$("body>div").hide();
		$(this).show();
	}).ajaxStop(function(){
		localStorage.setItem('activeList', activeList);
		window.location.reload();
	});
	$.ajax({
		type: "GET",
		url: "http://itunes/iTunes%20Music%20Library.xml",
		//url: "../iTunes%20Music%20Library.xml", //fileItunes,//urlXmlItunes,
		dataType: "xml",
		success: function(xml){
			var i= 0;
			var playlistCode= [];
			$(xml).find("plist dict dict string:contains('"+activeList+"')").nextAll("array").each(function(){
				$(this).find("dict").each(function(){
					playlistCode[i] = $(this).find("integer").text();
					i++;
				});
			});
			var playlist=[];
			var i= 0;
			$(playlistCode).each(function(){

				var idSong = $(xml).find("plist dict key:contains('"+playlistCode[i]+"')").next().find("key:contains('Persistent ID')").next().text();
				var nameSong = $(xml).find("plist dict key:contains('"+playlistCode[i]+"')").next().find("key:contains('Name')").next().text();

				var artistSong = $(xml).find("plist dict key:contains('"+playlistCode[i]+"')").next().find("key:contains('Artist')").next().text();
				var albumSong = $(xml).find("plist dict key:contains('"+playlistCode[i]+"')").next().find("key:contains('Album')").next().text();
				var locationSong = $(xml).find("plist dict key:contains('"+playlistCode[i]+"')").next().find("key:contains('Location')").next().text();
				playlist[i] = {'PersistentID': idSong, 'Name':nameSong, 'Artist':artistSong, 'Album':albumSong, 'Location': "../"+locationSong.substring(58)};
				//playlist[i] = {'PersistentID': idSong, 'Name':nameSong, 'Location':locationSong};
				i++;
			});
			localStorage.setItem(activeList, JSON.stringify(playlist));
		}
	});	
}

var switchList = function(){
	if(!windowSong){
		//location.search="";
		$("#bRecargarLibreria, #playList, #setting button, #setting #sPlayer, #playerSong").hide();
		$("#audio, #bRecargarLista, #setting #list, #listSong, #groupFoot, #footer").show();
	}else{
		$("#playList").hide();
		$("#playerSong").show();
	}
	//$("#bRecargarLibreria, #playList, #setting button, #setting #sPlayer, #playerSong").hide();
	$("#audio, #groupFoot, #footer").show();
	

	if(localStorage.getItem('continue')) continuo = localStorage.getItem('continue');
	if(!continuo){
		$("#bContinuo").removeClass("repeatAll");
		$("#bContinuo").removeClass("repeatOne");
	}else if(continuo == 1){
		$("#bContinuo").addClass("repeatAll");
	}else if(continuo == 2){
		$("#bContinuo").addClass("repeatOne");
	}
	
	random = localStorage.getItem('random');	
	if(random != "true"){
		$("#bAleatorio").removeClass("active").addClass("inActive");
	}else{
		$("#bAleatorio").removeClass("inActive").addClass("active");
	}
/*
	activeList = localStorage.getItem('activeList');
	parsePlayLists = jQuery.parseJSON(localStorage.getItem(activeList));
	playLists = jQuery.parseJSON(localStorage.getItem('playLists'))
	*/
	i = 0;
	$(playLists).each(function(){
		if(playLists[i].PersistentID == activeList) nameActiveList = playLists[i].name;
		i++;
	});
	i = 0;
	
	$("#listSong .header h1").remove();
	$("<h1>").html(nameActiveList).prependTo("#listSong .header");

	$("#botoneraPlayer button").removeClass("inactivo").addClass("activo");
}

var printList = function(){
	i = 0;
	$("#listSong .listado p").remove();
	$(parsePlayLists).each(function(){
		$("<p><span>"+parsePlayLists[i].Name+"</span></p>").appendTo("#listSong .listado");
		i++;
	});
	i = 0;
	$("#listSong .listado p").eq(b).addClass("active");
}

var eventList = function(){	
	$("#listSong .listado p").click(function(){
		windowSong = true;
		playSong = true;
		$("#listSong").hide();
		$("#playerSong").show();
		if($(this).index() != b){
			b = $(this).index();
			location.search="PersistentIDSong="+parsePlayLists[b].PersistentID;
		}
		if(settingActive)closeSettings();
	});
	
	$("#listSong #bBack").click(function(){
		if(settingActive){
			closeSettings();
			setTimeout(function(){
				printLibrery();
				eventLibrery();
				switchLibrery();
			},300);
		}else{
			printLibrery();
			eventLibrery();
			switchLibrery();
		}
	});
		
	$("#bRecargarLista").click(function(){
		closeSettings();
		setTimeout(function(){
			$("#playList, #bRecargarLibreria").show();
			$("#listSong, #bRecargarLista").hide();
			$("#botoneraPlayer button").removeClass("activo").addClass("inactivo");
			$("audio")[0].pause();
			localStorage.removeItem(activeList);
			loadList();
		},300);
	});
}

var eventSong = function(){
	
	$("#bSaveSong").click(function(){
		$.post("save.php", {PersistentID: activeSong, Lyric: localStorage.getItem(parsePlayLists[b].PersistentID)});
		localStorage.removeItem(activeSong);
		closeSettings();
	});

	$("#bSincronizar, #volverASincronizar").click(function(){
		$("#bSetting").click(function(){
			refresDataSong();
		});
		$("body").removeClass("noSincronizando").addClass("sincronizando");
		$("#exitLyric div p").removeAttr("style");
		$("#bSincronizar, #volverACargar, #volverASincronizar").hide();
		$("#bStepLine").show();
		$("#notification").addClass("secondary").html("Sincronizando").show();
		openSettings();
		$("#audio audio").attr("src", parsePlayLists[b].Location);
		$("audio")[0].play();
			
		$("#bSetting, #bBackList, #bNext, #bPrev").click(function(){
			$("body").removeClass("sincronizando").addClass("noSincronizando");
			stepStep.splice(u);
		});
	});
	
	$("#notification").click(function(){
		openSettings();
	});
	
	
	$("#bStepLine").click(function(){
		stepStep[u] = {'step' : parseInt($("audio")[0].currentTime), 'line': dataLyric[u].line};
		
		$(".sincronizando #exitLyric div p").animate({top:'-=22'}, 1000, 'linear');
		$(".sincronizando #exitLyric div p").eq(u-2).css({"color":"#212121" , "text-shadow":"0px -1px 0px rgba(0, 0, 0, 1), 0px 1px 0px rgba(255, 255, 255, 0.1)"});
		$(".sincronizando #exitLyric div p").eq(u-1).css({"color":"#303030", "text-shadow":"0px -1px 0px rgba(0, 0, 0, 0.2), 0px 1px 0px rgba(255, 255, 255, 0.2)"});
		$(".sincronizando #exitLyric div p").eq(u).css({"color":"#fff", "text-shadow":"0px 0px 7px rgba(255, 255, 255, 0.5)"});
		$(".sincronizando #exitLyric div p").eq(u+1).css({"color":"#303030", "text-shadow":"0px -1px 0px rgba(0, 0, 0, 0.2), 0px 1px 0px rgba(255, 255, 255, 0.2)"});

		$(".sincronizando #exitLyric div p").css({"top":"-"+22*u+"px"});
		
		if(u == dataLyric.length-1){
			localStorage.setItem(activeSong, JSON.stringify(stepStep));
			$("#bSincronizar").hide();
			$("#notification").hide();
			$("#bStepLine").hide();
			$("body").removeClass("sincronizando").addClass("noSincronizando");
			if(settingActive)closeSettings();
			u = 0;
			location.search="PersistentIDSong="+activeSong;
		};
		u++;
	});
		
	$("#volverACargar").click(function(){
		$("#introLyric, #bSendLyric").show();
		$("#notification").html("Copia y pega la letra").show();
		$("#exitLyric, #volverACargar, #bSincronizar, #volverASincronizar").hide();
			
			
		$("#bBackList, #bNext, #bPrev").click(function(){
			$("#notification, #introLyric").hide();
			$("#exitLyric").show();
		});
		
		$("#bSetting").click(function(){
			$("#notification").html("Esta cancion no esta sincronizada").removeClass().addClass("nNoSincronizada").show();
			$("#bSendLyric, #introLyric").hide();
			$("#volverACargar, #bSincronizar,#exitLyric").show();
		});

		document.formulario.lyric.value = null;
		var p = 0;
		var arrayLyric=[];
		$(dataLyric).each(function(){
			arrayLyric[p] = dataLyric[p].line+"\n";
			p++;
		});
		document.formulario.lyric.value = arrayLyric;
	});
		
	$("#bSendLyric").click(function(){
		closeSettings();
		setTimeout(function(){
			$("#exitLyric").show();
			var strLyric = document.formulario.lyric.value;
			localStorage.setItem(parsePlayLists[b].PersistentID, strLyric.replace(/\"/g,"&quot;").replace(/^/, '[{"line": "').replace(/$/, '"}]').replace(/\n\n/g, "\n").replace(/\n/g, '"},{"line": "'));
			document.formulario.lyric.value = null;
			$("#introLyric").hide();
			refresDataSong();
		},300);
	});

	$("#bPonerLetra").click(function(){
		window.open("http://lyrics.wikia.com/"+parsePlayLists[b].Artist+":"+parsePlayLists[b].Name+"?PersistentIDSong="+parsePlayLists[b].PersistentID ,"wikia");
		$("#bSetting").click(function(){
			refresDataSong();
		});
		$("#notification").addClass("secondary").html("Ponga la letra de la canción").show();
		$("#introLyric, #bSendLyric").show();
		$(this).hide();
		document.formulario.lyric.focus();
		
	});
		
	$("#bBackList").click(function(){
		if(settingActive){
			closeSettings();
			setTimeout(function(){
				windowSong = false;
				switchList();
				$("#listSong .listado").scrollTop((b - parseInt(($("#listSong .listado").height()/26)/2))*26);
			},300);
		}else{
			windowSong = false;
			switchList();
			$("#listSong .listado").scrollTop((b - parseInt(($("#listSong .listado").height()/26)/2))*26);
		}
	});
}

var eventPlay = function(){
	$("#bContinuo").click(function(){
		if(continuo == 0){
			continuo = 1;
			$(this).addClass("repeatAll");
		}else if(continuo == 1){
			continuo = 2;
			$(this).removeClass("repeatAll").addClass("repeatOne");
		}else if(continuo == 2){
			continuo = 0;
			$(this).removeClass("repeatOne");
		}
		localStorage.setItem('continue', continuo);
	});
	
	$("#bAleatorio").click(function(){
		if(random != "true"){
			random = "true";
			$(this).removeClass("inActive").addClass("active");
		}else if(random == "true"){
			random = "false";
			$(this).removeClass("active").addClass("inActive");
		}
		localStorage.setItem('random', random);
	});

  	$("#bPlay").click(function(){
		if(!playSong){
			$("audio")[0].play();
			$(this).addClass("play");
			playSong = true;
			refresDataSong();
		}else{
			$(this).removeClass("play");
			$("audio")[0].pause();
			playSong = false;
			clearInterval(playInterval);
		}
	});
	$("#bNext").click(function(){
		if(continuo == 0){
			if(b === parsePlayLists.length-1){
				b = 0;
			}else{
				b++;
				if(windowSong){
					location.search="PersistentIDSong="+parsePlayLists[b].PersistentID;
				}else{
					refresDataSong();
				}
			}
		}else if(continuo == 1){
			if(b === parsePlayLists.length-1){
				b = 0;
			}else{
				b++;
			}
			refresDataSong();
		}else{
			refresDataSong();
		}
		if(settingActive)closeSettings();
	});
	$("#bPrev").click(function(){
		if(b != 0)b--;
		if(windowSong){
			location.search="PersistentIDSong="+parsePlayLists[b].PersistentID;
		}else{
			refresDataSong();
		}
		if(settingActive)closeSettings();
	});	
}

var refresDataSong = function(){
	var $wh = window.innerHeight;
	activeSong = parsePlayLists[b].PersistentID;
	if(random == "true") b = Math.floor(Math.random()*(parsePlayLists.length-1));

	if(b >= parseInt(($("#listSong .listado").height()/26)/2)){
		if(b <= parseInt(parsePlayLists.length - ($("#listSong .listado").height()/26)/2)){
			scrollTopList = (b - parseInt(($("#listSong .listado").height()/26)/2))*26;
			$("#listSong .listado").scrollTop(scrollTopList);
		}
	}
	
	$("#listSong .listado p").removeClass("active");
	$("#listSong .listado p").eq(b).addClass("active");
	
	$("#listSong .listado span.active").remove();
	$("<span>").addClass("active").appendTo("#listSong .listado p:eq("+b+")");
	
	if(playSong) $("#bPlay").addClass("play");
		
	playInterval = setInterval(function(){
		if(parseInt($("audio")[0].currentTime) == parseInt($("audio")[0].duration)){
			if(continuo == 0){
				if(b === parsePlayLists.length-1){
					b = 0;
				}else{
					b++;
					if(windowSong){
						location.search="PersistentIDSong="+parsePlayLists[b].PersistentID;
					}else{
						refresDataSong();
					}
				}
			}else if(continuo == 1){
				if(b === parsePlayLists.length-1){
					b = 0;
				}else{
					b++;
				}
				if(windowSong){
					location.search="PersistentIDSong="+parsePlayLists[b].PersistentID;
				}else{
					refresDataSong();
				}
			}else{
				if(windowSong){
					location.search="PersistentIDSong="+parsePlayLists[b].PersistentID;
				}else{
					refresDataSong();
				}
			}

			$("#listSong .listado span.active").remove();
			$("<span>").addClass("active").appendTo("#listSong .listado p:eq("+b+")");
			
			$("#exitLyric").removeClass("sincronizando").addClass("noSincronizando");
			$("#bStepLine").hide();
			if(settingActive)closeSettings();
		}
	},1000);
	
	if(b != actualSong){
		$("#audio audio").attr("src", parsePlayLists[b].Location);
		if(playSong)$("audio")[0].play();
	}
	
	if(windowSong){
	$("#introLyric, #setting #list ,#notification, #bStepLine, #setting button, #bSincronizar, #volverACargar, #volverASincronizar").hide();
	$("#setting #sPlayer").show();
	$("#audio, #groupFoot, #footer, #playerSong").show();
	
	$("#exitLyric p").remove();
	$("#playerSong .header h1").remove();
	$("<h1>").html(parsePlayLists[b].Name).prependTo("#playerSong .header");
	
	clearInterval(markLyric);
	$.getJSON("data/"+activeSong+".json", function(data){
		dataLyric = data;
		i= 0;
  		$(dataLyric).each(function(){
    		$("<p>").html(dataLyric[i].line).appendTo("#exitLyric>div");
			i++;
		});
		t=0;
		markLyric = setInterval(function(){
			if(parseInt($("audio")[0].currentTime) <= dataLyric[dataLyric.length-1].step){
				if(dataLyric[t].step == parseInt($("audio")[0].currentTime)){
					$("#exitLyric div p").css({"top":"-"+22*t+"px"});
					$("#exitLyric div p").animate({top:'-=22'},parseInt((dataLyric[t+1].step-dataLyric[t].step)+"000"), 'linear');
					$("#exitLyric div p").eq(t).css({"color":"#fff", "text-shadow":"0px 0px 7px rgba(255, 255, 255, 0.5)"});
					$("#exitLyric div p").eq(t-1).css({"color":"#303030", "text-shadow":"0px -1px 0px rgba(0, 0, 0, 0.2), 0px 1px 0px rgba(255, 255, 255, 0.2)"});
					$("#exitLyric div p").eq(t-2).css({"color":"#212121" , "text-shadow":"0px -1px 0px rgba(0, 0, 0, 1), 0px 1px 0px rgba(255, 255, 255, 0.1)"});
					$("#exitLyric div p").eq(t+1).css({"color":"#303030", "text-shadow":"0px -1px 0px rgba(0, 0, 0, 0.2), 0px 1px 0px rgba(255, 255, 255, 0.2)"});
					t++;
				};
			};
		},1000);
	}).error(function(){
		dataLyric = jQuery.parseJSON(localStorage.getItem(parsePlayLists[b].PersistentID));
 		if(!localStorage.getItem(parsePlayLists[b].PersistentID)){
			$("#PersistentId").attr("value", parsePlayLists[b].PersistentID);
			$("#notification").removeClass().addClass("primary").addClass("nSinLetra").html("No hay letra para esta cancion. ¿Desea incluirla?").show();
			$("#bPonerLetra").show();
		}else{
			$("#bPonerLetra").hide();
			$("#volverACargar").show();
			i= 0;
  			$(dataLyric).each(function(){
    			$("<p>").html(dataLyric[i].line).appendTo("#exitLyric>div");
				i++;
			});
			
			if(!dataLyric[1].step){
				$("#notification").removeClass().addClass("primary").addClass("nNoSincronizada").html("Esta cancion no esta sincronizada").show();
				$("#bSincronizar").show();		
			}else{
				$("#bSaveSong, #volverASincronizar").show();
				t=0;
				markLyric = setInterval(function(){
					if(parseInt($("audio")[0].currentTime) <= dataLyric[dataLyric.length-1].step){
						if(dataLyric[t].step == parseInt($("audio")[0].currentTime)){
							$("#exitLyric div p").css({"top":"-"+22*t+"px"});
							$("#exitLyric div p").animate({top:'-=22'},parseInt((dataLyric[t+1].step-dataLyric[t].step)+"000"), 'linear');
							$("#exitLyric div p").eq(t).css({"color":"#fff", "text-shadow":"0px 0px 7px rgba(255, 255, 255, 0.5)"});
							$("#exitLyric div p").eq(t-1).css({"color":"#303030", "text-shadow":"0px -1px 0px rgba(0, 0, 0, 0.2), 0px 1px 0px rgba(255, 255, 255, 0.2)"});
							$("#exitLyric div p").eq(t-2).css({"color":"#212121" , "text-shadow":"0px -1px 0px rgba(0, 0, 0, 1), 0px 1px 0px rgba(255, 255, 255, 0.1)"});
							$("#exitLyric div p").eq(t+1).css({"color":"#303030", "text-shadow":"0px -1px 0px rgba(0, 0, 0, 0.2), 0px 1px 0px rgba(255, 255, 255, 0.2)"});
							t++;
						};
					};
				},1000);
			}
		}
	});
	}
	actualSong = b;
 }
function openSettings(){
    $("#bSetting").addClass("active");
	$("#groupFoot").removeClass("aniBack");
	$("#groupFoot").addClass("aniGo");
	settingActive = true;
}
function closeSettings(){
	$("#bSetting").removeClass("active");
	$("#groupFoot").removeClass("aniGo");
	$("#groupFoot").addClass("aniBack");
	settingActive = false;
}
function getQuerystring(key, default_)
{
  if (default_==null) default_=""; 
  key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
  var qs = regex.exec(window.location.href);
  if(qs == null)
    return default_;
  else
    return qs[1];
}
