<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>Liens</h2>
    <ul>
      <li><router-link to="/">Home</router-link></li>

      <li v-for="player in players" v-on:click="connect(player)">
        <a href="" onclick="return false">Se connecter en tant que {{ player.name }}</a>
      </li>
    </ul>
    <hr>


    <h2>Phrase à compléter</h2>
    <p>{{ sentenceToComplete }}</p>
    <hr>


    <div v-if="status != 'waitingBestCardElection'">
      <h2>Users connectés</h2>
      <p v-for="player in players">
        {{ player.name }} :
        <strong v-if="player.chosenCard">carte choisie</strong>
        <strong v-if="player.isMasterPlayer">maitre du tour</strong>
        <strong v-if="!player.chosenCard && !player.isMasterPlayer">carte non choisie</strong>
      </p>
      <hr>
    </div>


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
      <h2>Les éléments de {{ connectedPlayer.name }}</h2>
      <p v-for="card in connectedPlayer.cards">
        <!-- Carte : <strong>{{ card.text }}</strong> -->
        Carte : <strong>{{ card.text }}</strong>
        <button v-if="!connectedPlayer.chosenCard" v-on:click="selectCard(card)">Choisir cette carte</button>
      </p>
    </div>

    <!-- <h2>Divers</h2> -->
    <!-- <div>Nom de la room: {{ $route.params.roomName }}</div> -->
  </div>
</template>

<script>
import firebase from 'firebase'
var config = {
  databaseURL: 'https://komplet-95d95.firebaseio.com/'
}

var db = firebase.initializeApp(config).database()
var dbRef = db.ref('/')
var testRef = db.ref('test')
var roomRef = db.ref('rooms/0')

export default {
  name: 'room',
  data () {
    return {
      msg: 'Bienvenue sur la room "' + this.$route.params.roomName + '"',
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
    chooseNewCards: function () {
      var self = this
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
</style>
