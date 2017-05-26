<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>Choix de la room</h2>
    <ul>
      <li><router-link to="bouret">Bouret</router-link></li>
      <li><router-link to="test">Test</router-link></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Bienvenue sur Komplet'
    }
  }
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
