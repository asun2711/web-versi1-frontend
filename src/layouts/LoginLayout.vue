<template>
  <div class="login-layout">
    <div class="login-content">
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script lang="ts">

export default {
  name: "LoginLayout",
  components: { },
};
</script>

<style scoped>
.login-layout {
  display: flex;
  height: 100vh;
}
.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
main {
  padding: 1rem;
  background: #fafafa;
  flex: 1;
}
</style>
