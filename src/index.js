import { WebSocketServer } from 'ws';
import {gameManger} from "./gameManger.js"; 

const wss = new WebSocketServer({ port: 3000 });

const game = new gameManger() ; 
wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('close', ()=>{
    game.removeUser(ws); 
  })
  game.addNewUser(ws); 
  ws.send('done'); 
});