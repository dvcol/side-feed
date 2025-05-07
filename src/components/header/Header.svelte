<script lang="ts">
  import HeaderProgress from '~/components/header/HeaderProgress.svelte';
  import NavBar from '~/components/header/NavBar.svelte';
  import NavMenu from '~/components/header/NavMenu.svelte';
</script>

<header class="header">
  <div class="header-nav">
    <NavBar />
    <NavMenu />
  </div>
  <div class="header-progress">
    <HeaderProgress />
  </div>
</header>

<style lang="scss">
  .header {
    display: flex;
    flex-direction: column;
    align-items: center;

    &-nav {
      display: flex;
      flex: 1 1 auto;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      :global(> .neo-tabs button.neo-tab-button:disabled) {
        opacity: 0;
        pointer-events: none;
      }
    }

    &-progress {
      width: 100%;
      padding-inline: 0.75rem;
    }
  }
</style>
