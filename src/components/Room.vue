<template>
  <div class="hello">
    <nav class="navbar  bg-faded">
      <div class="container">
        <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="navbar-brand">
          <a  href="#"><i class="fa fa-lg fa-home" aria-hidden="true"> </i> Komplet</a> / {{ $route.params.roomName }}
          
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

      <div class="row">
        <div v-for="player in players" class="col-4 col-sm-3">
          <div v-on:click="!connectedPlayer ? connect(player) : connectedPlayer = null" v-bind:class="{ 'card-warning': player.isMasterPlayer, 'card-primary': player.chosenCard, 'card-info': !player.chosenCard && !player.isMasterPlayer, 'card-border': player == connectedPlayer }" class="card card-inverse mb-4">
            <div class="card-block">
              <div class="card-title">{{ player.score }}</div>
              <div class="card-text">{{ player.name }}</div>
            </div>
          </div>
        </div>
      </div>


      <p class="lead">{{ sentenceToComplete }}</p>
      <hr>


      <div v-if="status == 'waitingBestCardElection'">
        <h2>Les cartes à choisir</h2>
        <p v-if="connectedPlayer && connectedPlayer.isMasterPlayer" v-for="player in players">
          <button v-if="player.chosenCard" v-on:click="electCard(player)">{{ player.chosenCard.text }}</button>
        </p>
        <div v-if="connectedPlayer && !connectedPlayer.isMasterPlayer">
          <div v-for="player in players">
            <p v-if="player.chosenCard">{{ player.chosenCard.text }}</p>
          </div>
        </div>
        <hr>
      </div>


      <div v-if="status == 'showWinner'">
        <h2 class="red">Bravo {{ winner.name }}, tu as désormais {{ winner.score }} points !</h2>
        <hr>
      </div>

      <div v-if="connectedPlayer && !connectedPlayer.isMasterPlayer">
        <div v-for="card in connectedPlayer.cards"
             v-on:click="selectCardIfConnected(card)"
             v-bind:class="{'card-primary': connectedPlayer.chosenCard, 'card-info': !connectedPlayer.chosenCard}"
             class="card card-inverse mb-3">
          <div class="card-block">
            {{ card.text }}
          </div>
        </div>

      </div>

      <div v-if="!connectedPlayer">
        <p>
          <input v-model="name" type="text"> <button v-on:click="connectWithName(name)">Se connecter</button>
          <br>
          <br>
          <button v-on:click="reinit()" class="btn btn-sm btn-danger">Réinitialiser</button>
        </p>
      </div>
    </div>

    <!-- <h2>Divers</h2> -->
    <!-- <div>Nom de la room: {{ $route.params.roomName }}</div> -->
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
    },
    connectWithName: function (inputName) {
      if (inputName == '')
        return
      var self = this
      var playerAlreadyInGame = false
      if (self.players) {
        Object.keys(self.players).map(function(playerId, index) {
          var player = self.players[playerId]
          if (player.name == inputName) {
            self.connectedPlayer = player
            playerAlreadyInGame = true
          }
        })
      }
      // If player not already in game, create new player
      if (!playerAlreadyInGame) {
        var newPlayer = {
          name: inputName,
          isMasterPlayer: self.players == null,
          score: 0
        }

        var playerId = dbRef.child('rooms/0/players').push(newPlayer, function(error) {
          if (!error) {
            console.log("Joueur créé : ", self.players[playerId])
            dbRef.child('rooms/0/players/'+playerId+'/id').set(playerId, function(snapshot) {
              self.connectedPlayer = self.players[playerId]
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
      var newPostKey = firebase.database().ref().child('test').push().key

      // Push chosen card for this sentence
      dbRef.child('rooms/0/players/' + this.connectedPlayer.id + '/chosenCard').set(card , function(snapshot) {
        self.checkStatus()
      })

      // Delete card from player's hand
      dbRef.child('rooms/0/players/' + this.connectedPlayer.id + '/cards/').orderByChild('text').equalTo(card.text).once('value', function(snapshot) {
        var updates = {};
        snapshot.forEach(function(child){
          updates[child.key] = null;
        });
        dbRef.child('rooms/0/players/' + self.connectedPlayer.id + '/cards/').update(updates);
      })

      this.chooseNewCards()
    },
    selectCardIfConnected: function () {
      if (this.connectedPlayer != null)
        this.selectCard()
    },
    chooseNewCards: function () {
      var self = this
      if (!this.connectedPlayer.id)
        return
      var newCard = arrayRandomValue(this.cards)
      dbRef.child('rooms/0/players/' + this.connectedPlayer.id + '/cards').push(newCard);
      dbRef.child('rooms/0/players/' + this.connectedPlayer.id + '/cards').once('value', function(snapshot) {
        self.connectedPlayer.cards = snapshot.val()
        var length = Object.keys(self.connectedPlayer.cards).length
        if (length < 5) {
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
          if (!self.players)
            return
          Object.keys(self.players).map(function(playerId, index) {
            if (!self.players[playerId].chosenCard && !self.players[playerId].isMasterPlayer)
              stillWaitingCards = true
          })
          if (!stillWaitingCards) {
            self.status = 'waitingBestCardElection'
            dbRef.child('rooms/0/status').set(self.status)
          }
        }
      })
    },
    electCard: function (player) {
      var self = this
      dbRef.child('rooms/0/players/' + player.id + '/score').set(player.score + 1)
      Object.keys(self.players).map(function(playerId, index) {
        dbRef.child('rooms/0/players/' + self.players[playerId].id + '/chosenCard').remove()
      })
      this.setStatus('showWinner')
      dbRef.child('rooms/0/winner').set(player)
      setTimeout(function(){
        dbRef.child('rooms/0/currentSentence').set(pickRandomProperty(self.sentences).text)
        self.setStatus('waitingForCards')
        self.chooseNewMasterPlayer()
      }, 3000)
    },
    setStatus: function (status) {
      dbRef.child('rooms/0/status').set(status)
    },
    chooseNewMasterPlayer: function () {
      var self = this
      var nbPlayers = Object.keys(self.players).length
      var indexMasterPlayer = 0

      Object.keys(self.players).map(function(playerId, index) {
        var player = self.players[playerId]
        if (player.isMasterPlayer)
          indexMasterPlayer = (index+1)%nbPlayers // Next index
      })

      Object.keys(self.players).map(function(playerId, index) {
        var isMasterPlayer = index == indexMasterPlayer
        dbRef.child('rooms/0/players/'+playerId+'/isMasterPlayer').set(isMasterPlayer)
      })
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
    }
  },
  created: function () {
    var self = this
    dbRef.on('value', function(snapshot) {
      self.sentences = snapshot.val().sentences
      self.room = snapshot.val().rooms[0]
      self.players = self.room.players
      self.sentenceToComplete = self.room.currentSentence
      self.cards = snapshot.val().cards
      self.checkStatus()
    });

    // Updates of every variable on room changes
    roomRef.on('value', function(snapshot) {
      self.room = snapshot.val()
      self.players = snapshot.val().players
      self.sentenceToComplete = snapshot.val().currentSentence
      self.status = snapshot.val().status
      self.winner = snapshot.val().winner

      if (self.connectedPlayer && self.connectedPlayer.id != null)
        self.connectedPlayer = self.players[self.connectedPlayer.id]
    });
    db.ref('/room/0/status').on('value', function(snapshot) {
      self.status = snapshot.val()
    })
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
  color: #42b983;
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
  border: 2px solid black;
}
</style>
