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
    <div>{{ sentenceToComplete }}</div>

    <div v-if="connectedPlayer">
      <h2>Les cartes de {{ connectedPlayer.name }}</h2>
      <p v-for="card in cards">
        Carte : <strong>{{ card.text }}</strong>
        <button v-on:click="selectCard(card)">Choisir cette carte</button>
      </p>
      <!-- <div>{{ sentenceToComplete }}</div> -->
    </div>

    <!-- <h2>Divers</h2> -->
    <!-- <div>Nom de la room: {{ $route.params.roomName }}</div> -->
  </div>
</template>

<script>
import Firebase from 'firebase'
var config = {
  databaseURL: 'https://komplet-95d95.firebaseio.com/'
}

var db = Firebase.initializeApp(config).database()
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
      connectedPlayer: null,
      cards: null
    }
  },
  methods: {
    connect: function (player) {
      var self = this
      this.connectedPlayer = player
      self.cards = player.cards
    },
    selectCard: function (card) {
      // TODO: delete card from player's hand
      // TODO: push card for this sentence
    },
  },
  created: function () {
    var self = this
    this.test = 'Bob l\'éponge'
    dbRef.on('value', function(snapshot) {
      self.room = snapshot.val().rooms[0]
      self.players = self.room.players
      self.sentenceToComplete = self.room.currentSentence
    });
    roomRef.on('value', function(snapshot) {
    });
  }
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
