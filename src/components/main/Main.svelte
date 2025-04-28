<script lang="ts">
  import type { TransitionProps } from '@dvcol/svelte-simple-router';
  import type { FlyParams } from 'svelte/transition';

  import { RouterView } from '@dvcol/svelte-simple-router/components';
  import { sineInOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';

  import { router } from '~/router/router';

  const from = $derived(router.routing?.from.route?.meta?.index);
  const to = $derived(router.routing?.to.route?.meta?.index);

  const direction = $derived(to > from ? 150 : -150);

  const transition: TransitionProps = $derived({
    in: fly,
    out: fly,
    params: {
      in: { x: `${direction}%`, duration: 600, easing: sineInOut, opacity: 1 } satisfies FlyParams,
      out: { x: `${-direction}%`, duration: 600, easing: sineInOut, opacity: 1 } satisfies FlyParams,
    },
    props: {
      container: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          width: '100%',
        },
      },
      wrapper: {
        style: {
          display: 'flex',
          width: '100%',
        },
      },
    },
    skipFirst: true,
  });

</script>

<main>
  <RouterView {router} {transition} />
</main>

<style lang="scss">
  main {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
</style>
