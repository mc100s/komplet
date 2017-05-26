<template>
  <div class="hello container">
    <h1>{{ msg }}</h1>
    <h2>Cartes</h2>
    <div class="form-inline">
      <div class="mb-3">
        <input
          v-model.trim="newCardText"
          @keyup.enter="addCard"
          placeholder="Add new card"
          class="form-control"
        >
        <button v-on:click="addCard" class="btn btn-success">Ajouter la carte</button>
      </div>
      <ul>
        <li v-for="card in cards" class="mb-3">
          <input
            :value="card.text"
            @input="updateCardText(card, $event.target.value)"
            class="form-control"
          >
          <button @click="removeCard(card)"  class="btn btn-danger">X</button>
        </li>
      </ul>
    </div>
    <h2>Phrases</h2>
    <div class="form-inline">
      <div class="mb-3">
        <input
          v-model.trim="newSentenceText"
          @keyup.enter="addSentence"
          placeholder="Add new sentence"
          class="form-control"
        >
        <button v-on:click="addSentence" class="btn btn-success">Ajouter la carte</button>
      </div>
      <ul>
        <li v-for="sentence in sentences" class="mb-3">
          <input
            :value="sentence.text"
            @input="updateSentenceText(sentence, $event.target.value)"
            class="form-control"
          >
          <button @click="removeSentence(sentence)"  class="btn btn-danger">X</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
var db = firebase.database()

var cardsRef = db.ref('/cards')
var sentencesRef = db.ref('/sentences')

const mixin = {
  firebase: {
    cards: cardsRef,
    sentences: sentencesRef
  }
}

export default {
  name: 'hello',
  data () {
    return {
      msg: 'Paramètres',
      newCardText: '',
      newSentenceText: ''
    }
  },
  methods: {
    addCard: function () {
      if (this.newCardText) {
        cardsRef.push({
          text: this.newCardText,
          id: 'id'
        })
        this.newCardText = ''
      }
    },
    updateCardText: function (card, newText) {
      cardsRef.child(card['.key']).child('text').set(newText)
    },
    removeCard: function (card) {
      console.log("card", card)
      console.log("card['.key']", card['.key'])
      cardsRef.child(card['.key']).remove()
    },
    addSentence: function () {
      if (this.newSentenceText) {
        sentencesRef.push({
          text: this.newSentenceText,
          id: 'id'
        })
        this.newSentenceText = ''
      }
    },
    updateSentenceText: function (sentence, newText) {
      sentencesRef.child(sentence['.key']).child('text').set(newText)
    },
    removeSentence: function (sentence) {
      console.log("sentence", sentence)
      console.log("sentence['.key']", sentence['.key'])
      sentencesRef.child(sentence['.key']).remove()
    }
  },
  // created: function () {
  //   var self = this
  //   cardsRef.on('value', function(snapshot) {
  //     console.log("Hello")
  //     self.cards = snapshot.val()
  //   })
  // },
  mixins: [mixin]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  margin-top: 42px;
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
</style>
