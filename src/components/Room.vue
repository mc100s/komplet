<template>
  <div class="hello">
    <nav class="navbar  bg-faded">
      <div class="container">
        <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="navbar-brand">
          <a  href="#"><i class="fa fa-lg fa-star" aria-hidden="true"> </i> WhiteRussian</a> / {{ $route.params.roomName }}
          
        </div>

        <!-- <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <a class="nav-link" href="#">Komplet <span class="sr-only">(current)</span></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Link</a>
            </li>
            <li class="nav-item">
              <a class="nav-link disabled" href="#">Disabled</a>
            </li>
          </ul>
          <form class="form-inline my-2 my-lg-0">
            <input class="form-control mr-sm-2" type="text" placeholder="Search">
            <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
          </form>
        </div> -->
      </div>
    </nav>



    <div class="container">

      <div class="row justify-content-center mb-3">
        <div v-for="player in players" class="col-2 col-md-1 player-col">
          <div v-on:click="!connectedPlayer ? connect(player) : connectedPlayer = null" v-bind:class="{ 'card-warning': player.isMasterPlayer, 'card-primary': player.chosenCard, 'card-info': !player.chosenCard && !player.isMasterPlayer, 'card-border': connectedPlayer && player['.key'] == connectedPlayer['.key'] }" class="card card-inverse card-block">
            <div class="card-title">{{ player.score }}</div>
            <div class="card-text">{{ player.name }}</div>
          </div>
        </div>
      </div>


      <p class="lead">« {{ sentenceToComplete }} »</p>
      <hr>

      <div v-if="status == 'waitingForCards' && connectedPlayer && connectedPlayer.isMasterPlayer" class="dialog">
        <img src="../assets/white-russian.png" class="character pull-right">

        <div class="balloon">
          <p>Hey {{ connectedPlayer.name }}, tu es le maitre du tour ! Dès que tout le monde aura joué sa carte, tu devras choisir celle que tu trouves qui va le mieux avec le texte du dessus !</p>
          <p class="mb-0">
            Pour le moment, on attend :
            <ul class="mb-0">
              <li v-for="player in players" v-if="!player.chosenCard && !player.isMasterPlayer">
                <strong>{{ player.name }} </strong> 
              </li>
            </ul>
          </p>
        </div>
      </div>


      <div v-if="status == 'waitingBestCardElection'">
        <div class="row">
          <div v-for="player in getPlayersWithChosenCards(players)"
               class="col-6 card-col">
            <div v-if="player.chosenCard">
              <div v-if="connectedPlayer && connectedPlayer.isMasterPlayer"
                    v-on:click="electCard(player)"
                    class="card card-block card-warning card-inverse player-card" >
                {{ player.chosenCard.text }}
              </div>
              <div v-else class="card card-block player-card">
                {{ player.chosenCard.text }}
              </div>
            </div>
          </div>
        </div>

        <div class="dialog mt-4">
          <img src="../assets/white-russian.png" class="character pull-right">

          <div class="balloon">
            <div v-if="connectedPlayer && connectedPlayer.isMasterPlayer" class="mb-0">
              Choisis la carte qui te plait le plus !
            </div>
            <div v-else class="mb-0">
              C'est à  
              <strong v-for="player in players" v-if="player.isMasterPlayer">
                {{ player.name }}
              </strong>
              de choisir la carte qui lui plait le plus !
            </div> 
          </div>
        </div>
        <hr>

      </div>


      <div v-if="status == 'showWinner'">
        <div class="dialog mt-4">
          <img src="../assets/white-russian.png" class="character pull-right">

          <div class="balloon">
            Bravo <strong>{{ winner.name }}</strong>, tu as désormais {{ winner.score+1 }} points grâce à la carte "<strong>{{ winner.chosenCard.text }}</strong>" !
          </div>
        </div>
        <hr>
      </div>

      <!-- Player's cards -->
      <div v-if="connectedPlayer && !connectedPlayer.isMasterPlayer" class="row">
        <div v-for="card in connectedPlayer.cards"
             class="col-6 card-col">
          <div v-on:click="selectCardIfPossible(card)"
               v-bind:class="{'card-primary': connectedPlayer.chosenCard, 'card-info': !connectedPlayer.chosenCard}"
               class="card card-inverse card-block player-card">
            <div class="card-text">
              {{ card.text }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="!connectedPlayer">
        <h2 cla>Connexion</h2>
        <div class="row mb-3">
          <div class="col-6 col-sm-8">
            <input v-model="name" class="form-control" placeholder="Nom utilisateur" type="text">
          </div>
          <div class="col-6 col-sm-4">
            <button v-on:click="connectWithName(name)" class="btn btn-success btn-block">Se connecter</button>
          </div>
        </div>
        <div class="row">
          <div class="offset-3 col-6">
            <button v-on:click="reinit()" class="btn btn-block btn-danger">Réinitialiser la partie</button>
          </div>
        </div>
      </div>
    </div>

    <!-- <h2>Divers</h2> -->
    <!-- <div>Nom de la room: {{ $route.params.roomName }}</div> -->
    <div class="mt-5"><small>{{ status }}</small></div>
  </div>
</template>

<script>
import firebase from 'firebase'
var config = {
  apiKey: "AIzaSyCd9Cs7jN1z59CFH8SGVhRUm7vUJb-3OQ4",
  authDomain: "komplet-95d95.firebaseapp.com",
  databaseURL: "https://komplet-95d95.firebaseio.com",
  projectId: "komplet-95d95",
  storageBucket: "komplet-95d95.appspot.com",
  messagingSenderId: "560302182334"
};

var db = firebase.initializeApp(config).database()
var dbRef = db.ref('/')
var testRef = db.ref('test')
var roomRef = db.ref('rooms/0')

export default {
  name: 'room',
  data () {
    return {
      msg: 'Bienvenue sur la room "' + this.$route.params.roomName + '"',
      name: '',
      connectedPlayer: null,
      test: '',
      sentences: null,
      room: null,
      players: null,
      sentenceToComplete: '',
      status: '',
      winner: null
    }
  },
  methods: {
    connect: function (player) {
      var self = this
      this.connectedPlayer = player
      // console.log("connect")
      // console.log("this.connectedPlayer", this.connectedPlayer)
    },
    connectWithName: function (inputName) {
      if (inputName == '')
        return
      var self = this
      var playerAlreadyInGame = false
      if (self.players) {
        for (var i = 0; i < self.players.length; i++) {
          var player = self.players[i]
          if (player.name == inputName) {
            self.connectedPlayer = player
            playerAlreadyInGame = true
          }
        }
      }
      // If player not already in game, then create new player
      if (!playerAlreadyInGame) {
        var newPlayer = {
          name: inputName,
          isMasterPlayer: self.players.length == 0,
          score: 0
        }

        var playerId = dbRef.child('rooms/0/players').push(newPlayer, function(error) {
          if (!error) {
            self.connectedPlayer = self.players[self.players.length-1]
            self.connectedPlayer.playerId = playerId
            console.log("Joueur créé : ", self.connectedPlayer)
            console.log("self.players : ", self.players)
            console.log("playerId : ", playerId)
            dbRef.child('rooms/0/players/'+playerId+'/id').set(playerId, function(snapshot) {
              // self.connectedPlayer = self.players[playerId]
              // console.log("self.connectedPlayer : ", self.connectedPlayer)
              self.chooseNewCards()
            })
          }
        }).key


        // self.connectedPlayer = self.createNewPlayer(inputName)
      }
      // this.connectedPlayer = player
    },
    selectCard: function (card) {
      var self = this

      // Push chosen card for this sentence
      dbRef.child('rooms/0/players/' + this.connectedPlayer['.key'] + '/chosenCard').set(card , function(snapshot) {
        self.checkStatus()
      })

      // Delete card from player's hand
      dbRef.child('rooms/0/players/' + this.connectedPlayer['.key'] + '/cards/').orderByChild('text').equalTo(card.text).once('value', function(snapshot) {
        var updates = {};
        snapshot.forEach(function(child){
          updates[child.key] = null;
        });
        dbRef.child('rooms/0/players/' + self.connectedPlayer['.key'] + '/cards/').update(updates);
      })

      this.chooseNewCards()
    },
    selectCardIfPossible: function (card) {
      if (this.connectedPlayer != null && !this.connectedPlayer.chosenCard)
        this.selectCard(card)
    },
    chooseNewCards: function () {
      var self = this
      console.log("this.connectedPlayer", this.connectedPlayer)
      if (!this.connectedPlayer || !this.connectedPlayer['.key'])
        return
      var newCard = pickRandomProperty(this.cards)
      for (var i = 0; i < 10; i++) {
        if (!this.isCardAlreadyInGame(newCard))
          break
          newCard = pickRandomProperty(this.cards)
      }
      dbRef.child('rooms/0/players/' + this.connectedPlayer['.key'] + '/cards').push(newCard);
      dbRef.child('rooms/0/players/' + this.connectedPlayer['.key'] + '/cards').once('value', function(snapshot) {
        self.connectedPlayer.cards = snapshot.val()
        var length = self.connectedPlayer.cards ? Object.keys(self.connectedPlayer.cards).length : 0
        if (length < 8) {
          self.chooseNewCards()
        }
        self.checkStatus()
      });
    },
    checkStatus: function () {
      var self = this
      dbRef.child('rooms/0/status').once('value', function(snapshot) {
        self.status = snapshot.val()
        if (self.status == 'started') {
          self.status = 'waitingForCards'
          dbRef.child('rooms/0/status').set(self.status)
        }
        if (self.status == 'waitingForCards') {
          var stillWaitingCards = false
          for (var i = 0; i < self.players.length; i++) {
            if (!self.players[i].chosenCard && !self.players[i].isMasterPlayer)
              stillWaitingCards = true
          }
          if (!stillWaitingCards) {
            self.status = 'waitingBestCardElection'
            dbRef.child('rooms/0/status').set(self.status)
          }
        }
      })
    },
    electCard: function (player) {
      var self = this
      console.log("[DEBUG] electCard")
      console.log("player", player)
      dbRef.child('rooms/0/players/' + player['.key'] + '/score').set(player.score + 1)
      for (var i = 0; i < self.players.length; i++) {
        dbRef.child('rooms/0/players/' + self.players[i]['.key'] + '/chosenCard').remove()
      }
      this.setStatus('showWinner')
      delete player['.key']
      dbRef.child('rooms/0/winner').set(player)
      setTimeout(function(){
        dbRef.child('rooms/0/currentSentence').set(pickRandomProperty(self.sentences).text)
        self.setStatus('waitingForCards')
        self.chooseNewMasterPlayer()
      }, 5000)
    },
    setStatus: function (status) {
      dbRef.child('rooms/0/status').set(status)
    },
    chooseNewMasterPlayer: function () {
      var self = this
      var nbPlayers = self.players.length
      var indexMasterPlayer = 0

      for (var i = 0; i < self.players.length; i++) {
        if (self.players[i].isMasterPlayer)
          indexMasterPlayer = (i+1)%self.players.length // Next index
      }

      for (var i = 0; i < self.players.length; i++) {
        var isMasterPlayer = i == indexMasterPlayer
        dbRef.child('rooms/0/players/'+self.players[i]['.key']+'/isMasterPlayer').set(isMasterPlayer)
      }
    },
    reinit: function () {
      var roomContent = {
        "currentSentence" : "Le plus adroit, c'est ...",
        // "players" : {
        //   "0" : {
        //     "cards" : {
        //       "-KkuF42WEoQApiYqqzrs" : {
        //         "id" : 4,
        //         "text" : "Donald Trump"
        //       },
        //       "-KkuF42c-YLdmHlIzbPS" : {
        //         "id" : 1,
        //         "text" : "Superman"
        //       },
        //       "-KkuFGroNcyn7XsLGj0G" : {
        //         "id" : 0,
        //         "text" : "Emmanuel Macron"
        //       },
        //       "-KkuU9SWewhV3ONuD4f9" : {
        //         "id" : 1,
        //         "text" : "Superman"
        //       },
        //       "-KkuU9SlOv1GKpLOfES_" : {
        //         "id" : 1,
        //         "text" : "Superman"
        //       }
        //     },
        //     "id" : 0,
        //     "isMasterPlayer" : false,
        //     "name" : "Maxence",
        //     "score" : 1
        //   }
        // },
       "roomName" : this.room.roomName,
        "status" : "waitingForCards"
      }
      dbRef.child('rooms/0').set(roomContent)
    },
    getPlayersWithChosenCards: function(players) {
      var self = this
      var result = []
      for (var i = 0; i < self.players.length; i++) {
        var player = self.players[i]
        if (player.chosenCard) {
          result.push(player)
        }
      }
      result.sort(function compare(a, b){
        return a.chosenCard.text > b.chosenCard.text
      })
      // console.log("players", players)
      // console.log("result", result)
      return result
    },
    isCardAlreadyInGame: function(card) {
      var self = this
      var result = false
      if (!self.players)
        return result
      for (var i = 0; i < self.players.length; i++) {
        var player = self.players[i]
        if (!player.cards)
          return result
        Object.keys(player.cards).map(function(cardId, cardIndex) {
          var curCard = player.cards[cardId]
          // console.log("curCard", curCard)
          // console.log("card", card)
          if (curCard.text == card.text)
            result = true;
        })
      }
      return result  
      // return card.text == "Emmanuel Macron" || card.text == "Donald Trump" || card.text == "Nicolas Sarkozy"  
    }
  },
  created: function () {
    var self = this
    dbRef.on('value', function(snapshot) {
      self.sentences = snapshot.val().sentences
      self.room = snapshot.val().rooms[0]
      self.sentenceToComplete = self.room.currentSentence
      self.cards = snapshot.val().cards
      self.checkStatus()
    });

    // Updates of every variable on room changes
    roomRef.on('value', function(snapshot) {
      self.room = snapshot.val()
      self.sentenceToComplete = snapshot.val().currentSentence
      self.status = snapshot.val().status
      self.winner = snapshot.val().winner

      // if (self.connectedPlayer && self.connectedPlayer['.key'] != null)
      //   self.connectedPlayer = self.players[self.connectedPlayer['.key']]
    });
    db.ref('/room/0/status').on('value', function(snapshot) {
      self.status = snapshot.val()
    })
  },
  firebase: function () {
    return {
      // players: db.ref('rooms/0/players'),
      players: {
        source: db.ref('rooms/0/players'),
        readyCallback: function () {
          var self = this
          db.ref('rooms/0/players').on('value', function(snapshot) {
            var players = snapshot.val()
            if (self.connectedPlayer) {
              var key = self.connectedPlayer['.key']
              self.connectedPlayer = players[key]
              self.connectedPlayer['.key'] = key
            }
          })
        }
      },
      anObject: {
        source: db.ref('rooms/0/players'),
        // optionally bind as an object
        // asObject: true,
        // asArray: true,
        // optionally provide the cancelCallback
        cancelCallback: function () {},
        // this is called once the data has been retrieved from firebase
        readyCallback: function () {}
      }
    }
  }
}

/* Utilities functions */
var arrayRandomValue = function(a) {
  return a[Math.floor(Math.random() * a.length)]
}
var pickRandomProperty = function (obj) {
  var keys = Object.keys(obj)
  return obj[keys[ keys.length * Math.random() << 0]];
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.navbar {
  margin-bottom: 20px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #F44336;
}

.red {
  color: red;
}

.card-block {
  padding: 10px;
}
.card-block .card-title {
  font-size: 1.5em;
}
.card-border {
  /*outline: 2px solid black;
  outline-offset: -2px;*/
  box-shadow: 0 0 0 2px black;
  /*border: 2px solid black;*/
}

.player-col {
  padding: 2px;
/*  float: none;
  margin: 0 auto;*/
}
.player-col .card-block {
  padding: 2px;
}
.player-col .card-title {
  margin-bottom: 0px;
}
.player-col .card-text {
  clear: both;
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  line-height: 1em;
  padding-bottom: 2px;
  font-size: 0.8rem;
}

.card-text {
  color: rgba(255,255,255,.8);
  font-weight: 500;
}

.player-card {
  margin-bottom: .5rem;
  min-height: 4rem;
  line-height: 0.9em;
}

.player-card {
  display: flex;
  justify-content: center;
  align-items: center;
}

.player-card .card-text {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-col {
  padding-left: 5px;
  padding-right: 5px;
}

.dialog {
  position: relative;
  padding-top: 10px;
}

.dialog img.character {
  width: 80px;
  position: absolute;
  bottom: 0;
  right: 0;
}

.dialog .balloon {
  border: 2px solid #212121;
  border-radius: 10px;
  padding: 10px;
  margin-right: 100px;
  /*background-color: #fafafa;*/
}




</style>
