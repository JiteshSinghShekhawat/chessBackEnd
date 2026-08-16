import {BLACK, Chess} from 'chess.js'; 
import { DRAW, LOSE, WIN } from './messages.js';

class Game{
    player1; 
    player2; 
    board = new Chess(); 
    #moveCount ; 
    timer1; 
    timer2; 
    timerInterval; 
    gameOn ; 

    constructor(player1,player2){
        this.#moveCount = 0 ; 
        this.player1 = player1; 
        this.player2 = player2;
        this.printBoardWithPieces(); 
        this.gameOn = true; 
        this.timer1 = {minutes: 3, seconds:0, isActive: false}; 
        this.timer2 = {minutes: 3, seconds:0, isActive: false}; 
        this.player2.send(JSON.stringify({type:"PIECES",color: "BLACK"})); 
        this.player1.send(JSON.stringify({type:"PIECES",color: "WHITE"})); 
        this.startTimer(this.timer1,this.player1); 
    }
    printBoardWithPieces() {
        const rawAscii = this.board.ascii();
        const rows = rawAscii.trim().split('\n');
        var newBoard = '' ; 

        const trimmedRows = rows.map((row, rowIndex) => {
            
            if(rowIndex < 10)
                for(let col of row){
                    if(col !== ' ' && col !== '-' && col !== '+' && col !== '|'){
                        newBoard += col; 
                    }
                }
        });
        this.player1.send(JSON.stringify({type: "board",board: newBoard})); 
        this.player2.send(JSON.stringify({type: "board",board: newBoard})); 
    }
    gameEndDueToTime(player){
        if(player === this.player1){
            this.player1.send(JSON.stringify({type:"MESSAGE",MESSAGE: LOSE})); 
            this.player2.send(JSON.stringify({type:"MESSAGE",MESSAGE: WIN})); 
        }else{
            this.player1.send(JSON.stringify({type:"MESSAGE",MESSAGE: WIN})); 
            this.player2.send(JSON.stringify({type:"MESSAGE",MESSAGE: LOSE})); 
        }
        this.gameOn = false; 
    }
    sendTime(){
        this.player1.send(JSON.stringify({
            type : "TIME", 
            white : this.timer1, 
            black : this.timer2
        })); 
        this.player2.send(JSON.stringify({
            type : "TIME", 
            white : this.timer2, 
            black : this.timer1
        })); 
    }
    startTimer(timer,player){
        clearInterval(this.timerInterval); 
        timer.isActive = true ; 
        this.timerInterval = setInterval(()=>{
            if(timer.seconds === 0){
                if(timer.minutes === 0){
                    clearInterval(this.timerInterval); 
                    this.gameEndDueToTime(player); 
                }else{
                    timer.minutes -= 1; 
                    timer.seconds = 59; 
                }
            }else{
                timer.seconds -= 1; 
            }
            this.sendTime(); 
        },1000)
    }
    stopTimer(timer){
        timer.isActive = false ;
        clearInterval(this.timerInterval); 
    }
    makeMove(socket,from,to){

        if(!this.gameOn)return ;
        if(this.#moveCount%2 === 0 && socket === this.player2)return ; 
        if(this.#moveCount%2 !== 0 && socket === this.player1)return ; 

        try{
            this.board.move({
                from,
                to
            }); 
            var move = ''; 
            if(this.#moveCount%2 === 0 ){
                move = 'white' ; 
                this.stopTimer(this.timer1); 
                this.startTimer(this.timer2,this.player2); 
            }
            else{
                move = 'black'; 
                this.stopTimer(this.timer2); 
                this.startTimer(this.timer1,this.player1); 
            }
            this.player1.send(JSON.stringify({type:"LOG",player: move,move : to}))
            this.player2.send(JSON.stringify({type:"LOG",player: move,move : to}))
            this.#moveCount++; 
        }catch(e){

        }
        this.printBoardWithPieces(); 

        if(this.board.isDraw()){
            this.player1.send(JSON.stringify({type:"MESSAGE",MESSAGE: DRAW})); 
            this.player2.send(JSON.stringify({type:"MESSAGE",MESSAGE: DRAW})); 
            return ; 
        }
        if(this.board.isCheckmate()){
            if(this.#moveCount %2 === 0 ){
                this.player1.send(JSON.stringify({type:"MESSAGE",MESSAGE: LOSE})); 
                this.player2.send(JSON.stringify({type:"MESSAGE",MESSAGE: WIN})); 
            }
            else{
                this.player2.send(JSON.stringify({type:"MESSAGE",MESSAGE: LOSE})); 
                this.player1.send(JSON.stringify({type:"MESSAGE",MESSAGE: WIN})); 
            }
            return ; 
        }
    }
}


export {Game}; 
