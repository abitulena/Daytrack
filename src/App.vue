<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  overflow: hidden;
  height: 100%;
}

#app {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  font-family: 'KyivType Sans', Arial, sans-serif;
  background: #BEAEDB;
}
</style>