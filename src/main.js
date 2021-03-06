var colors = require('colors'),
_ = require('lodash'),
prompt = require('prompt');

prompt.message = '';
prompt.start();

var Game = function () {
  this.printer = require('./printer');
  this.deck = _.shuffle(require('./deck'));
  this.hand = require('hoyle').Hand;
  this.humanState = [true, false];
  this.round = 0;
};

Game.prototype.startGame = function () {
  console.log('Dealing first row of cards, Good Luck!');

  this.p1Hands = [];
  this.p2Hands = [];
  for (var i = 0; i < 10; i++) {
    if (i < 5) {
      this.p1Hands.push([this.deck.shift()]);
    } else {
      this.p2Hands.push([this.deck.shift()]);
    }
  }
  this.mainLoop();
};

Game.prototype.mainLoop = function () {
  if (this.round === 40) {
    this.determineWinner();
    return;
  }

  this.curr = (this.round % 2 === 0) ? 1 : 2;
  this.activeCard = this.deck.shift();
  console.log('Round Number ' + this.round);
  this.printGameState();
  this.getMove();
};

Game.prototype.isHuman = function (playerID) {
  return this.humanState[playerID - 1];
};

Game.prototype.getMove = function () {
  if (this.isHuman(this.curr)) {
    this.getHumanMove();
  } else {
    this.getAiMove();
  }
};


Game.prototype.getHumanMove = function () {
  var that = this;
  var promptMessage = 'Player ' + this.curr + ' enter column number';
  prompt.get([promptMessage], function (err, input) {
    var columnNumber = parseInt(input[promptMessage], 10);
    if (!that.isValidInput(columnNumber)) {
      console.log('That isnt a valid choice');
      that.getMove();
    } else {
      that.makeMove(columnNumber);
    }
  });
};
//returns an array of legal column moves
Game.prototype.getPossibleMoves = function () {
  var arr = [];
  for (var i = 0; i < 5; i++) {
    if (this.isValidInput(i)) {
      arr.push(i);
    }
  }
  return arr;
};

Game.prototype.getAiMove = function () {
  var moves = this.getPossibleMoves();
  this.makeMove(_.sample(moves));
};

Game.prototype.makeMove = function (columnNumber) {
  this.addToHand(columnNumber);
  this.round += 1;
  this.mainLoop();
};

Game.prototype.isValidInput = function (number) {
  if (isNaN(number) || number < 0 || number > 4) {
    return false;
  }
  var activePlayerHands = (this.curr === 1) ? this.p1Hands : this.p2Hands;
  var minLength = _.min(activePlayerHands, function (hand) { return hand.length; }).length;
  if (activePlayerHands[number].length !== minLength) {
    return false;
  }
  return true;
};

Game.prototype.addToHand = function (column) {
  if (this.curr === 1) {
    this.p1Hands[column].push(this.activeCard);
  } else {
    this.p2Hands[column].push(this.activeCard);
  }
};

Game.prototype.determineWinner = function () {
  var p1WinCount = 0;
  for (var i = 0; i < this.p1Hands.length; i++) {
    var hand1 = this.hand.make(this.p1Hands[i]);
    var hand2 = this.hand.make(this.p2Hands[i]);
    var winner = this.hand.pickWinners([hand1, hand2])[0];
    if (winner === hand1) {
      p1WinCount += 1;
    }
  }
  console.log((p1WinCount >= 3) ? 'Player 1 wins' : 'Player 2 wins');
  console.log('Game Over');
};

Game.prototype.printGameState = function () {
  console.log('\033[2J');
  this.printer.printHands(this.p1Hands, 'Player 1 Hands:');
  this.printer.printHands(this.p2Hands, 'Player 2 Hands:');
  console.log('current card is:', this.printer.printCard(this.activeCard));
};

var myGame = new Game();
myGame.startGame();