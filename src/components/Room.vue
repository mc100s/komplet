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

    <h2>Users connectés</h2>
    <p v-for="player in players">
      {{ player.name }} :
      <strong v-if="player.chosenCard">carte choisie</strong>
      <strong v-else>carte non choisie</strong>
    </p>

    <div v-if="connectedPlayer">
      <h2>Les cartes de {{ connectedPlayer.name }}</h2>
      <p v-for="card in connectedPlayer.cards">
        <!-- Carte : <strong>{{ card.text }}</strong> -->
        Carte : <strong>{{ card }}</strong>
        <button v-on:click="selectCard(card)">Choisir cette carte</button>
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
var playerRef = db.ref('rooms/0/players/0')

export default {
  name: 'room',
  data () {
    return {
      msg: 'Bienvenue sur la room "' + this.$route.params.roomName + '"',
      test: '',
      room: null,
      players: null,
      sentenceToComplete: '',
      cards: null,
      connectedPlayer: null,
      cards: null
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
      dbRef.child('rooms/0/players/0/chosenCard').push(card)

      // Delete card from player's hand
      dbRef.child('rooms/0/players/0/cards/').orderByChild('text').equalTo(card.text).once('value', function(snapshot) {
        var updates = {};
        snapshot.forEach(function(child){
          updates[child.key] = null;
        });
        dbRef.child('rooms/0/players/0/cards/').update(updates);
      })

      this.chooseNewCards()
    },
    chooseNewCards: function () {
      console.log('chooseNewCards')
      var self = this
      var newCard = arrayRandomValue(this.cards)
      dbRef.child('rooms/0/players/0/cards').push(newCard);
      dbRef.child('rooms/0/players/0/cards').once('value', function(snapshot) {
        self.connectedPlayer.cards = snapshot.val()
        var length = Object.keys(self.connectedPlayer.cards).length
        // console.log("", Object.keys(self.connectedPlayer.cards).length)
        if (length < 5) {
          self.chooseNewCards()
        }
      });
    }
  },
  created: function () {
    var self = this
    this.test = 'Bob l\'éponge'
    dbRef.on('value', function(snapshot) {
      self.room = snapshot.val().rooms[0]
      self.players = self.room.players
      self.sentenceToComplete = self.room.currentSentence
      self.cards = snapshot.val().cards
    });
    roomRef.on('value', function(snapshot) {
    });
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
</style>
