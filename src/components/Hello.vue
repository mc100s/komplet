<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <img src="../assets/white-russian.png">
    <h2>Choix de la room</h2>
    <ul>
      <li><router-link to="evg">EVG</router-link></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'hello',
  data () {
    return {
      msg: 'WhiteRussian'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
  margin-top: 42px;
  margin-bottom: 30px;
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

img {
  height: 150px;
}
</style>
