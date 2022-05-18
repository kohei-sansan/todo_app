<template>
  <my-header></my-header>
  <my-body></my-body>
  <my-footer></my-footer>
</template>

<script>
import MyBody from './components/MyBody.vue'
import MyHeader from './components/MyHeader.vue'
import MyFooter from './components/MyFooter.vue'

export default {
  name: 'App',
  components: {
    MyBody,
    MyHeader,
    MyFooter
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: 2c3e50;
  /*margin-top: 60px;*/
  background-color: #f5efe9;
}
</style>
