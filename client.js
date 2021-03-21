// ==UserScript==
// @name     anime-sync 
// @version  2.0
// @grant GM_xmlhttpRequest
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_deleteValue
// @grant GM_listValues
// @grant GM_addStyle
// @grant GM_getResourceText
// @grant GM_notification
// @grant GM.xmlHttpRequest
// @match *://twist.moe/a/*
// @match *://*.gogoanime.tv/*
// @match *://*.gogoanime.io/*
// @match *://*.gogoanime.in/*
// @match *://*.gogoanime.se/*
// @match *://*.gogoanime.sh/*
// @match *://*.gogoanime.video/*
// @match *://*.gogoanime.movie/*
// @match *://*.gogoanime.so/*
// @match *://*.gogoanime.ai/*
// @match *://*.gogoanime.vc/*
// @match *://*.gogoanimes.co/*
// @match *://*.gogo-stream.com/*
// @match *://*.gogo-play.net/*
// @match *://static.crunchyroll.com/*
// @include *://*.crunchyroll.com*
// @include *vidstream.pro*
// @include *youtube.com*
// @include *9anime.to*
// @exclude *crunchyroll.com/
// @exclude *crunchyroll.com
// @exclude *crunchyroll.com/acct*
// @exclude *crunchyroll.com/anime-feature/*
// @exclude *crunchyroll.com/anime-news/*
// @exclude *crunchyroll.com/comics*
// @exclude *crunchyroll.com/edit*
// @exclude *crunchyroll.com/email*
// @exclude *crunchyroll.com/forum*
// @exclude *crunchyroll.com/home*
// @exclude *crunchyroll.com/inbox*
// @exclude *crunchyroll.com/library*
// @exclude *crunchyroll.com/login*
// @exclude *crunchyroll.com/manga*
// @exclude *crunchyroll.com/newprivate*
// @exclude *crunchyroll.com/news*
// @exclude *crunchyroll.com/notifications*
// @exclude *crunchyroll.com/order*
// @exclude *crunchyroll.com/outbox*
// @exclude *crunchyroll.com/pm*
// @exclude *crunchyroll.com/search*
// @exclude *crunchyroll.com/store*
// @exclude *crunchyroll.com/user*
// @exclude *crunchyroll.com/videos*
// @exclude *crunchyroll.com/affiliate_iframeplayer*
// @grant GM.getValue
// @grant GM.setValue
// ==/UserScript==

let sites=["www.crunchyroll.com","twist.moe","www.youtube.com","www14.9anime.to","gogoanime.ai"]
let iframe={}
iframe["www.crunchyroll.com"]="static.crunchyroll.com";
iframe["www14.9anime.to"]="vidstream.pro";
iframe["gogoanime.ai"]="gogo-play.net";


let socket;
let socketAddress="wss://yourserverip:3333";
//gui
var parentdiv=document.createElement("DIV");
var div=document.createElement("DIV");
var play = document.createElement("BUTTON");
var pause = document.createElement("BUTTON");
var sync = document.createElement("BUTTON");
var episode=document.createElement("BUTTON");
var connect=document.createElement("BUTTON");
var disconnect=document.createElement("BUTTON");
var seek = document.createElement("BUTTON");
var seekto=document.createElement("INPUT");
var join=document.createElement("BUTTON");
var leave=document.createElement("BUTTON");
var room=document.createElement("INPUT");
var txt=document.createElement("P");
var roomtxt=document.createElement("P");

//funkcije
function connect_socket(socket){
    socket = new WebSocket(socketAddress);
    socket.onmessage = function (event) {
        console.log(event.data);
        let parsedMsg=JSON.parse(event.data);
        if(parsedMsg.action=="play"){
          if(iframe[window.location.host]===undefined)
            document.getElementsByTagName('video')[0].play();
          else{
          document.querySelector("iframe").contentWindow.postMessage(JSON.stringify({action:"play"}), window.location.protocol+"//"+iframe[window.location.host]);
          }
        }else if(parsedMsg.action=="pause"){
            if(iframe[window.location.host]===undefined)
            document.getElementsByTagName('video')[0].pause();
             else{
          document.querySelector("iframe").contentWindow.postMessage(JSON.stringify({action:"pause"}), window.location.protocol+"//"+iframe[window.location.host]);
                    }
        }else if(parsedMsg.action=="seek"){
            if(iframe[window.location.host]===undefined){
            document.getElementsByTagName('video')[0].pause();
            document.getElementsByTagName('video')[0].currentTime=parsedMsg.time;
            }
          else{
          document.querySelector("iframe").contentWindow.postMessage(JSON.stringify({action:"pause"}), window.location.protocol+"//"+iframe[window.location.host]);
           document.querySelector("iframe").contentWindow.postMessage(JSON.stringify({action:"seek",time:parsedMsg.time}), window.location.protocol+"//"+iframe[window.location.host]);
          }
        }else if(parsedMsg.action=="buffering"){
            //TO DO
        }else if(parsedMsg.action=="urlchange"){
            if(sites.includes(window.location.host))
            if(window.location.href!=parsedMsg.url)
            window.location.href=parsedMsg.url;
            }
        }
        socket.onopen = function (event) {
            txt.innerHTML="Connected!";
            GM.getValue("lastRoom").then(function (value){socket.send(JSON.stringify({action:"join",room:value}))})
          };
          socket.onclose = function (event) {
            txt.innerHTML="Disonnected!";
          };
          return socket;
}
function close_socket(){
    socket.close();
}
function updateroom(txt){
    GM.getValue("lastRoom").then(function (value){txt.innerHTML="In room: "+ value})

}
if(iframe[window.location.host]===undefined){
    //il je sajt bez iframe il je sam iframe
    if(sites.includes(window.location.host))
    {
        //////////////////////
        //    samo player   //
        //////////////////////
        sync.onclick=function(){
            socket.send(JSON.stringify({action:"seek",time: document.getElementsByTagName('video')[0].currentTime}))
        }

    }else{
        //////////////////////
        //        iframe    //
        //////////////////////
        console.log("iframe");
        //prima i salje podatke main stranici
            var eventMethod = window.addEventListener
                    ? "addEventListener"
                    : "attachEvent";
            var eventer = window[eventMethod];
            var messageEvent = eventMethod === "attachEvent"
                ? "onmessage"
                : "message";

            eventer(messageEvent, function (e) {
                let parsedMsg=JSON.parse(e.data);
                if(parsedMsg.action=="play")
                    document.querySelector("video").play();
                if(parsedMsg.action=="pause")
                    document.querySelector("video").pause();
                if(parsedMsg.action=="seek")
                    document.querySelector("video").currentTime=parsedMsg.time;
                if(parsedMsg.action=="sync")
                   parent.postMessage(JSON.stringify({action:"time",time: document.querySelector('video').currentTime}),window.location.protocol+"//"+Object.getOwnPropertyNames(iframe).find(x=>iframe[x]===window.location.host))

            });
    }
}else{
    //////////////////////
    //    glavni sajt   //
    //////////////////////
        console.log("main");
        //prima podatke od iframe
            var eventMethod = window.addEventListener
                    ? "addEventListener"
                    : "attachEvent";
            var eventer = window[eventMethod];
            var messageEvent = eventMethod === "attachEvent"
                ? "onmessage"
                : "message";

            eventer(messageEvent, function (e) {
                let parsedMsg=JSON.parse(e.data);
                if(parsedMsg.action=="time"){
                    socket.send(JSON.stringify({action:"seek",time:parsedMsg.time}));
                }

            });
            sync.onclick=function(){
                document.querySelector("iframe").contentWindow.postMessage(JSON.stringify({action:"sync"}), window.location.protocol+"//"+iframe[window.location.host]);
            }
}
(async () => {
if(await GM.getValue("lastRoom")===undefined){
     GM.setValue("lastRoom","none");
}
    if(await GM.getValue("lastConn")===undefined){
         GM.setValue("lastConn","false");
    }else{
        if(await GM.getValue("lastConn")=="true")
        {
            if(sites.includes(window.location.host))
               if(window.frameElement==null)
               {
               socket=connect_socket(socket);
                   console.log(window.location.href);
               }

        }
    }
    })();


    //uredjenje
    parentdiv.style.position = 'fixed';
    parentdiv.style.bottom = '0px';
    parentdiv.style.left = '0px';
    parentdiv.style.width = '240px';
    parentdiv.style.height = '140px';
    div.setAttribute("id", "anime-sync");
    div.style.position = 'fixed';
    div.style.bottom = '0px';
    div.style.left = '0px';
    div.style.width = '200px';
    div.style.height = '260px';
    div.style.color = 'black';
    div.style.background = 'lightblue';
    div.style.padding = '20px';
    div.style.visibility="hidden";
    div.style.zIndex = "10001";
    parentdiv.style.zIndex = "10001";
    play.innerHTML="Play";
    pause.innerHTML="Pause";
    sync.innerHTML="Sync";
    seek.innerHTML="Seek to";
    episode.innerHTML="Episode";
    connect.innerHTML="Connect";
    disconnect.innerHTML="Disconnect";
    join.innerHTML="Join room";
    leave.innerHTML="Leave room";
    room.setAttribute("type","text");
    txt.innerHTML="Not Connected!";
    GM.getValue("lastRoom").then(function (value){roomtxt.innerHTML="In room: "+ value})
    seekto.setAttribute("type","number");
    seekto.value=0.0;

    parentdiv.onmouseover=function(){
        div.style.visibility="visible";
    }
    parentdiv.onmouseout=function(){
        div.style.visibility="hidden";
    }
    //definicija dugmica
    play.onclick=function(){
        socket.send(JSON.stringify({action:"play"}))

    }
    pause.onclick=function(){
        socket.send(JSON.stringify({action:"pause"}))
    }
    //sync mora posebno ako je iframe il video pa je definisan gore
    seek.onclick=function(){
        socket.send(JSON.stringify({action:"seek",time:seekto.value}))
    }
    episode.onclick=function(){
        socket.send(JSON.stringify({action:"urlchange",url:window.location.href}))
    }
    connect.onclick=function(){

      if(socket===undefined || socket.readyState!=1){
        socket=connect_socket(socket);
         GM.setValue("lastConn","true");
      }
    }
    disconnect.onclick=function(){
        if(socket!==undefined){
        socket.close()
        GM.setValue("lastConn","false");
        }
    }
    join.onclick=function(){
        socket.send(JSON.stringify({action:"join",room:room.value}))
         GM.setValue("lastRoom",room.value);
        updateroom(roomtxt);
    }
    leave.onclick=function(){
        socket.send(JSON.stringify({action:"leave"}))
         GM.setValue("lastRoom","none");
        updateroom(roomtxt);
    }
    //prikazi gui
    if(sites.includes(window.location.host)){
    document.body.appendChild(parentdiv);
    parentdiv.appendChild(div);
    document.getElementById("anime-sync").appendChild(play);
    document.getElementById("anime-sync").appendChild(pause);
    document.getElementById("anime-sync").appendChild(sync);
    document.getElementById("anime-sync").appendChild(episode);
    document.getElementById("anime-sync").appendChild(seek);
    document.getElementById("anime-sync").appendChild(seekto);
    document.getElementById("anime-sync").appendChild(connect);
    document.getElementById("anime-sync").appendChild(disconnect);
    document.getElementById("anime-sync").appendChild(join);
    document.getElementById("anime-sync").appendChild(leave);
    document.getElementById("anime-sync").appendChild(room);
    document.getElementById("anime-sync").appendChild(txt);
    document.getElementById("anime-sync").appendChild(roomtxt);
    }