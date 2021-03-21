const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3333 });
let url,currentTime,state;
let participants=0;

wss.on('connection', function connection(ws) {
    ws.room="none";
    participants++;
  ws.on('message', function incoming(message) {
    let parsedMsg=JSON.parse(message);
        if(parsedMsg.action=="join"){
          ws.room=parsedMsg.room;
        }
        else if(parsedMsg.action=="leave"){
          ws.room="none";
        }else{
        wss.clients.forEach(function each(client) {
            if(client.room==ws.room && ws.room!="none")
            client.send(message);   
     });
    }
    
  });
  ws.on('close', function(data) {
      
    participants--;
  });
});
console.log("server started");