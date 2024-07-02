import {Chess} from 'chess.js'; 
import { DRAW, LOSE, WIN } from './messages.js';

class Game{
    player1; 
    player2; 
    board = new Chess(); 
    #moveCount ; 
    constructor(player1,player2){
        this.#moveCount = 0 ; 
        this.player1 = player1; 
        this.player2 = player2;
        this.printBoardWithPieces(); 
        this.player2.send(JSON.stringify({type:"PIECES",color: "BLACK"})); 
        this.player1.send(JSON.stringify({type:"PIECES",color: "WHITE"}));
    }
    printBoardWithPieces() {
        const rawAscii = this.board.ascii();
        const rows = rawAscii.trim().split('\n');
        var newBoard = '' ; 
        // Filter out the extraneous characters and add row indices
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
    makeMove(socket,from,to){

        if(this.#moveCount%2 === 0 && socket === this.player2)return ; 
        if(this.#moveCount%2 !== 0 && socket === this.player1)return ; 

        try{
            this.board.move({
                from,
                to
            }); 
            var move = ''; 
            if(this.#moveCount%2 === 0 )move = 'white' ; 
            else move = 'black'; 
            this.player1.send(JSON.stringify({type:"LOG",player: move,move : to}))
            this.player2.send(JSON.stringify({type:"LOG",player: move,move : to}))
            this.#moveCount++; 
        }catch(e){

        }
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
        this.printBoardWithPieces(); 
    }
}


export {Game}; 