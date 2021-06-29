/*jslint browser this */
/*global _, player, computer, utils */

(function () {
  "use strict";
  window.rightClick = false;
  //étape ,déroulement de la partie
  var game = {
    PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
    PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
    PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
    PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
    PHASE_GAME_OVER: "PHASE_GAME_OVER",
    PHASE_WAITING: "waiting",
    //phase actuelle
    currentPhase: "",
    //ordre des phases
    phaseOrder: [],
    // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
    playerTurnPhaseIndex: 2,

    // l'interface utilisateur doit-elle être bloquée ?
    waiting: false,

    // garde une référence vers les noeuds correspondant du dom
    grid: null,
    miniGrid: null,

    // liste des joueurs
    players: [],

    // lancement du jeu
    init: function () {
      // initialisation
      this.grid = document.querySelector(".board .main-grid");
      this.miniGrid = document.querySelector(".mini-grid");

      // défini l'ordre des phase de jeu
      this.phaseOrder = [
        this.PHASE_INIT_PLAYER,
        this.PHASE_INIT_OPPONENT,
        this.PHASE_PLAY_PLAYER,
        this.PHASE_PLAY_OPPONENT,
        this.PHASE_PLAY_PLAYER,
        this.PHASE_GAME_OVER,
      ];
      this.playerTurnPhaseIndex = 0;

      // initialise les joueurs
      this.setupPlayers();

      // ajoute les écouteur d'événement sur la grille
      this.addListeners();

      // c'est parti !
      this.goNextPhase();
    },
    setupPlayers: function () {
      // donne aux objets player et computer une réference vers l'objet game
      player.setGame(this);
      computer.setGame(this);

      // todo : implémenter le jeu en réseaux
      this.players = [player, computer];

      this.players[0].init();
      this.players[1].init();
    },
    goNextPhase: function () {
      // récupération du numéro d'index de la phase courante
      var ci = this.phaseOrder.indexOf(this.currentPhase);
      var self = this;

      if (ci !== this.phaseOrder.length - 1) {
        this.currentPhase = this.phaseOrder[ci + 1];
      } else {
        this.currentPhase = this.phaseOrder[0];
      }

      switch (this.currentPhase) {
        case this.PHASE_GAME_OVER:
          utils.info("game over");
          break;
        case this.PHASE_INIT_PLAYER:
          utils.info("Placez vos bateaux");
          break;
        case this.PHASE_INIT_OPPONENT:
          this.wait();
          utils.info("En attente de votre adversaire");
          this.players[1].isShipOk(function () {
            self.stopWaiting();
            self.goNextPhase();
          });
          break;
        case this.PHASE_PLAY_PLAYER:
          utils.info("A vous de jouer, choisissez une case !");
          break;
        case this.PHASE_PLAY_OPPONENT:
          utils.info("A votre adversaire de jouer...");
          this.players[1].play();
          break;
      }
    },
    gameIsOver: function () {
      var i;
      var g = false;
      this.players.forEach(function (player) {
        i = 0;
        player.fleet.forEach(function (ship) {
          if (ship.getLife() === 0) {
            i++;
          }
        });
        if (i === player.fleet.length) {
          g = true;
        }
      });
      return g;
    },
    getPhase: function () {
      if (this.waiting) {
        return this.PHASE_WAITING;
      }
      return this.currentPhase;
    },
    // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
    wait: function () {
      this.waiting = true;
    },
    // met fin au mode mode "attente"
    stopWaiting: function () {
      this.waiting = false;
    },
    addListeners: function () {
      // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
      this.grid.oncontextmenu = new Function("return false");
      this.grid.addEventListener("mousemove", _.bind(this.handleMouseMove, this));
      this.grid.addEventListener("click", _.bind(this.handleClick, this));
      this.grid.addEventListener("contextmenu", _.bind(this.rightClick, this));
    },
    rightClick: function (e) {
      var ship = this.players[0].fleet[this.players[0].activeShip];
      if (window.rightClick === false) {
        ship.dom.style.transform = "rotate(90deg)";
        window.rightClick = true;
      } else {
        ship.dom.style.transform = "rotate(0deg)";
        window.rightClick = false;
      }
      if (ship.getLife() === 4 && window.rightClick === true) {
        ship.dom.style.top =
          "" + utils.eq(e.target.parentNode) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) - 30 + "px";
        ship.dom.style.left =
          "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + 30 + "px";
      } else {
        ship.dom.style.top =
          "" + utils.eq(e.target.parentNode) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) + "px";
        ship.dom.style.left =
          "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
      }
    },
    handleMouseMove: function (e) {
      // on est dans la phase de placement des bateau
      if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains("cell")) {
        var ship = this.players[0].fleet[this.players[0].activeShip];
        // si on a pas encore affiché (ajouté aux DOM) ce bateau
        if (!ship.dom.parentNode) {
          this.grid.appendChild(ship.dom);
          // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
          ship.dom.style.zIndex = -1;
        }

        // décalage visuelle, le point d'ancrage du curseur est au milieu du bateau
        if (ship.getLife() === 4 && window.rightClick === true) {
          ship.dom.style.top =
            "" + utils.eq(e.target.parentNode) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) - 30 + "px";
          ship.dom.style.left =
            "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + 30 + "px";
        } else {
          ship.dom.style.top =
            "" + utils.eq(e.target.parentNode) * utils.CELL_SIZE - (600 + this.players[0].activeShip * 60) + "px";
          ship.dom.style.left =
            "" + utils.eq(e.target) * utils.CELL_SIZE - Math.floor(ship.getLife() / 2) * utils.CELL_SIZE + "px";
        }
      }
    },
    handleClick: function (e) {
      // self garde une référence vers "this" en cas de changement de scope
      var self = this;

      // si on a cliqué sur une cellule (délégation d'événement)
      if (e.target.classList.contains("cell")) {
        // si on est dans la phase de placement des bateau
        if (this.getPhase() === this.PHASE_INIT_PLAYER) {
          // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
          if (this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode))) {
            // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
            if (!this.players[0].activateNextShip()) {
              this.wait();
              utils.confirm(
                "Confirmez le placement ?",
                function () {
                  // si le placement est confirmé
                  self.stopWaiting();
                  self.renderMiniMap();
                  self.players[0].clearPreview();
                  self.goNextPhase();
                },
                function () {
                  self.stopWaiting();
                  // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                  self.players[0].resetShipPlacement();
                }
              );
            }
          }
          // si on est dans la phase de jeu (du joueur humain)
        } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
          setTimeout(function () {
            self.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode));
            self.renderMap();
          }, 500);
        }
      }
    },
    // fonction utlisée par les objets représentant les joueurs (ordinateur ou non)
    // pour placer un tir et obtenir de l'adversaire l'information de réusssite ou non du tir
    fire: function (from, col, line, callback) {
      this.wait();
      var self = this;
      var msg = "";

      // determine qui est l'attaquant et qui est attaqué
      var target = this.players.indexOf(from) === 0 ? this.players[1] : this.players[0];
      var previousContent = target.grid[line][col];
      if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
        msg += "Votre adversaire vous a ... ";
      }
      if (from.tries[line][col] !== 0) {
        msg += "retire au meme endroit, une maj est necessaire";
        utils.info(msg);
        callback(from.tries[line][col]);
      } else {
        // on demande à l'attaqué si il a un bateaux à la position visée
        // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
        target.receiveAttack(col, line, function (hasSucceed) {
          if (hasSucceed) {
            var ship;
            if (self.players.indexOf(from) === 0) {
              ship = target.fleet[previousContent - 5];
            } else {
              ship = target.fleet[previousContent - 1];
            }
            ship.setLife(ship.getLife() - 1);
            msg += "Touché !";
          } else {
            msg += "Manqué...";
          }
          utils.info(msg);
          // on invoque la fonction callback (4e paramètre passé à la méthode fire)
          // pour transmettre à l'attaquant le résultat de l'attaque
          callback(hasSucceed);
        });

        if (this.gameIsOver()) {
         alert("Fin de la partie");
         window.location.reload();
        }
      }
      // on fait une petite pause avant de continuer...
      // histoire de laisser le temps au joueur de lire les message affiché
      setTimeout(function () {
        self.stopWaiting();
        self.goNextPhase();
      }, 500);
    },
    renderMap: function () {
      this.players[0].renderTries(this.grid);
    },
    renderMiniMap: function () {
      document.getElementsByClassName("mini-grid").item(0).style.marginTop = "-210px";
      document.getElementsByClassName("mini-grid").item(0).innerHTML = document
        .getElementsByClassName("main-grid")
        .item(0).innerHTML;
    },
  };

  // point d'entrée
  document.addEventListener("DOMContentLoaded", function () {
    game.init();
  });
})();
