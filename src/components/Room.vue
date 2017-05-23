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

    <h2>Phrase à compléter</h2>
    <p>{{ sentenceToComplete }}</p>

    <div v-if="status != 'waitingBestCardElection'">
      <h2>Users connectés</h2>
      <p v-for="player in players">
        {{ player.name }} :
        <strong v-if="player.chosenCard">carte choisie</strong>
        <strong v-else>carte non choisie</strong>
      </p>
    </div>

    <div v-if="status == 'waitingBestCardElection'">
      <h2>Les cartes à choisir</h2>
      <p v-for="player in players">
        <button v-if="player.chosenCard" v-on:click="electCard(player)">{{ player.chosenCard.text }}</button>
      </p>
    </div>

    <div v-if="status == 'showWinner'">
      <h2 class="red">Bravo {{ winner.name }}, tu as désormais {{ winner.score }} points !</h2>
    </div>

    <div v-if="connectedPlayer">
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
      console.log(player)
      // self.cards = player.cards
    },
    selectCard: function (card) {
      var self = this
      var newPostKey = firebase.database().ref().child('test').push().key
      console.log(newPostKey)
      // console.log(firebase.database().ref().child('test').remove())

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
      console.log('chooseNewCards')
      var self = this
      var newCard = arrayRandomValue(this.cards)
      dbRef.child('rooms/0/players/' + this.connectedPlayer.id + '/cards').push(newCard);
      dbRef.child('rooms/0/players/' + this.connectedPlayer.id + '/cards').once('value', function(snapshot) {
        self.connectedPlayer.cards = snapshot.val()
        var length = Object.keys(self.connectedPlayer.cards).length
        // console.log("", Object.keys(self.connectedPlayer.cards).length)
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
          for (var i = 0; i < self.players.length; i++) {
            if (!self.players[i].chosenCard)
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
      dbRef.child('rooms/0/players/' + player.id + '/score').set(player.score + 1)
      for (var i = 0; i < this.players.length; i++) {
        dbRef.child('rooms/0/players/' + this.players[i].id + '/chosenCard').remove()
      }
      this.setStatus('showWinner')
      dbRef.child('rooms/0/winner').set(player)
      setTimeout(function(){
        // dbRef.child('rooms/0/currentSentence').set('Lorem ipsum') // TODO: change a setence !!!
        self.setStatus('waitingForCards')
      }, 3000)
    },
    setStatus: function (status) {
      dbRef.child('rooms/0/status').set(status)
    }
  },
  created: function () {
    var self = this
    dbRef.on('value', function(snapshot) {
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
