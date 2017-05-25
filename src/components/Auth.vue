<template>
  <div class="auth">
    <h1>{{ msg }}</h1>
    <h2>Choix de la room</h2>
    <ul>
      <li><router-link to="soiree">Soirée</router-link></li>
      <li><router-link to="soiree2">Soirée 2</router-link></li>
      <li><router-link to="test">Test</router-link></li>
    </ul>
  </div>
</template>

<script>
import firebase from 'firebase'
// var config = {
//   apiKey: "AIzaSyCd9Cs7jN1z59CFH8SGVhRUm7vUJb-3OQ4",
//   authDomain: "komplet-95d95.firebaseapp.com",
//   databaseURL: "https://komplet-95d95.firebaseio.com",
//   projectId: "komplet-95d95",
//   storageBucket: "komplet-95d95.appspot.com",
//   messagingSenderId: "560302182334"
// };
// firebase.initializeApp(config);

var email = "maxence.bouret@gmail.com"
var password = "Komplet42"

firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
  if (error.code == 'auth/email-already-in-use') {
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log("Error!!!!!!!!!!!!")
      console.log(error.code)
      console.log(error.message)
      // ...
    });
  }
  else {
    console.log("Error!!!!!!!!!!!!")
    console.log(error.code)
    console.log(error.message)
  }
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;
    console.log("Connexion!!")
    console.log(user.displayName)
    console.log(user.email)
    console.log(user.emailVerified)
    console.log(user.photoURL)
    console.log(user.isAnonymous)
    console.log(user.uid)
    // ...
  } else {
    // User is signed out.
    // ...
  }
});



export default {
  name: 'auth',
  data () {
    return {
      msg: 'Authentification'
    }
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
