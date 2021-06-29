/*jslint browser this */
/*global _, player */

(function (global) {
    "use strict";

    var computer = _.assign({}, player, {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        setGame: function(param) {
            this.game = param;
        },
        play: function () {
            var self = this;
            var x = Math.floor(Math.random() * 9);
            var y = Math.floor(Math.random() * 9);
            while (self.tries[y][x] !== 0) {
                x = Math.floor(Math.random() * 9);
                y = Math.floor(Math.random() * 9);
            }
            var previousContent = self.game.players[0].grid[y][x];
            setTimeout(function () {
                self.game.fire(self, x, y, function (hasSucced) {
                    self.tries[y][x] = hasSucced;
                    if (hasSucced) {
                        var ship = self.game.players[0].fleet[previousContent - 1];
                        var cell = self.game.miniGrid.querySelector('.row:nth-child(' + (y + 1) + ') .cell:nth-child(' + (x + 1) + ')');
                        cell.style.backgroundColor = '#e60019';
                        if (ship.getLife() === 0) {
                            var divShip = document.querySelector(".fleet").children[previousContent - 1];
                            divShip.classList.add("sunk");
                        }
                    }
                });
            }, 500);
        },
        isShipOk: function (callback) {
            var i = 0;
            while(i < 4) {
                var x = Math.round(Math.random()*9);
                var y = Math.round(Math.random()*9);
                var a = Math.round(Math.random());
                if (a > 0.5) {
                    window.rightClick = true;
                } else {
                    window.rightClick = false;
                }
                if(this.setActiveShipPosition(y,x)) {
                    this.activateNextShip();
                    i++;
                }
            }

            setTimeout(function () {
                callback();
            }, 500);
            // a enlever
            console.table(this.grid);
        }
    });
    global.computer = computer;

}(this));
