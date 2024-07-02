import {WebSocket} from "ws";
import { INIT_GAME, MOVE } from "./messages.js";
import {Game} from "./game.js"; 

class gameManger {
    #users; 
    #pendingUsers; 
    #Games; 

    constructor(){
        this.#users = []; 
        this.#pendingUsers = null; 
        this.#Games = []; 
    }

    addNewUser(socket){
        this.#users.push(socket); 
        this.#addHandler(socket); 
    }
    removeUser(socket){
        this.#users = this.#users.filter((user)=>user !== socket); 
        if(socket === this.#pendingUsers){
            this.#pendingUsers = null; 
            return ; 
        }
        const temp = null; 

        for(let i=0;i<this.#Games.length;i++){
            if(this.#Games[i].player1 === socket){
                this.#Games[i].player2.send(JSON.stringify({type:"MESSAGE",MESSAGE:'sorry other player have left the game, we are finding other player for you. '})); 
                this.#addLeftUser(this.#Games[i].player2); 
                this.#Games.splice(i,1); 
                break; 
            }
            if(this.#Games[i].player2 === socket){
                this.#Games[i].player1.send(JSON.stringify({type:"MESSAGE",MESSAGE:'sorry other player have left the game, we are finding other player for you. '})); 
                this.#addLeftUser(this.#Games[i].player1); 
                this.#Games.splice(i,1); 
                break; 
            }
        }
    }
    #addLeftUser(socket){
        if(!this.#pendingUsers){
            this.#pendingUsers = socket; 
        }
        else{
            const game = new Game(this.#pendingUsers,socket); 
            this.#Games.push(game); 
            this.#pendingUsers = null; 
        }
    }
    #addHandler(socket){
        socket.on('message',(data)=>{
            const message = JSON.parse(data.toString()); 
            if(message.type === INIT_GAME){
                if(!this.#pendingUsers){
                    this.#pendingUsers = socket; 
                }
                else{
                    const game = new Game(this.#pendingUsers,socket); 
                    this.#Games.push(game); 
                    
                    this.#pendingUsers = null; 
                }
            }
            if(message.type === MOVE){
                try{
                    const game = this.#Games.find(game => game.player1 === socket || game.player2 === socket); 
                    if(game){
                        game.makeMove(socket,message.from,message.to); 
                    }
                }catch(e){
                    console.log(e); 
                }
            }
        })
    }
}

export {gameManger}; 