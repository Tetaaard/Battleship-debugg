/*jslint browser this */
/*global _, shipFactory, player, utils */

(function (global) {
    "use strict";

    var ship = {dom: {parentNode: {removeChild: function () {}}}};

    var player = {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        activeShip: 0,
        setGame: function(param) {
            this.game = param;
        },
        init: function () {
            // créé la flotte
            this.fleet.push(shipFactory.build(shipFactory.TYPE_BATTLESHIP));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_DESTROYER));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SUBMARINE));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SMALL_SHIP));

            // créé les grilles
            this.grid = utils.createGrid(10, 10);
            this.tries = utils.createGrid(10, 10);
        },
        play: function (col, line) {
            // appel la fonction fire du game, et lui passe une calback pour récupérer le résultat du tir
            this.game.fire(this, col, line, _.bind(function (hasSucced) {
                this.tries[line][col] = hasSucced;
            }, this));
        },
        // quand il est attaqué le joueur doit dire si il a un bateaux ou non à l'emplacement choisi par l'adversaire
        receiveAttack: function (col, line, callback) {
            var succeed = false;

            if (this.grid[line][col] !== 0) {
                succeed = true;
                this.grid[line][col] = 0;
            }
            callback.call(undefined, succeed);
        },
        setActiveShipPosition: function (x, y) {
            var ship = this.fleet[this.activeShip];
            if (window.rightClick) {
                var y = y - Math.floor(ship.getLife() / 2);
                for (var j = 0; j < ship.getLife(); j++) {
                    if (y+ship.getLife()-1 > 9 || y < 0 || this.grid[y + j][x] !== 0) {
                        return false;
                    }
                }
                for(var i = 0; i < ship.getLife(); i++) {
                    this.grid[y + i][x] = ship.getId();
                }
            } else {
                var x = x - Math.floor(ship.getLife() / 2);
                for (var j = 0; j < ship.getLife(); j++) {
                    if (this.grid[y][x + j] !== 0) {
                        return false;
                    }
                }
                for(var i = 0; i < ship.getLife(); i++) {
                    this.grid[y][x + i] = ship.getId();
                }
            }
            return true;
        },
        clearPreview: function () {
            this.fleet.forEach(function (ship) {
                if (ship.dom.parentNode) {
                    ship.dom.parentNode.removeChild(ship.dom);
                }
            });
        },
        resetShipPlacement: function () {
            this.clearPreview();
            this.activeShip = 0;
            this.grid = utils.createGrid(10, 10);
        },
        activateNextShip: function () {
            window.rightClick = false;
            if (this.activeShip < this.fleet.length - 1) {
                this.activeShip += 1;
                return true;
            } else {
                return false;
            }
        },
        renderTries: function (grid) {
         this.tries.forEach(function (row, rid) {
           row.forEach(function (val, col) {
             var node = grid.querySelector(".row:nth-child(" + (rid + 1) + ") .cell:nth-child(" + (col + 1) + ")");

             if (val === true) {
               let miss = new Audio("sounds/hit.mp3");
               miss.play();
               node.style.backgroundImage = "url('img/mintouché.gif')"; //rouge touché
               //node.style.backgroundColor = '#e60019';//rouge touché
             } else if (val === false) {
               let miss = new Audio("sounds/miss.mp3");
               miss.play();
               node.style.backgroundImage = "url('img/mincoulé.gif')"; //rouge touché
               //node.style.backgroundColor = '#aeaeae';//gris coulé
             }
           });
         });
       },
  

    };

    global.player = player;

}(this));
