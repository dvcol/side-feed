<script lang="ts">
  import type { TransitionProps } from '@dvcol/svelte-simple-router';
  import type { ScaleFreezeParams } from '@dvcol/svelte-utils/transition';
  import type { FlyParams } from 'svelte/transition';

  import { RouterView } from '@dvcol/svelte-simple-router/components';
  import { scaleFreeze } from '@dvcol/svelte-utils/transition';
  import { sineInOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';

  import { router } from '~/router/router';

  const from = $derived({ index: -1, transition: fly, ...router.routing?.from?.location?.meta });
  const to = $derived({ index: -1, transition: fly, ...router.routing?.to?.meta });

  const direction = $derived(to.index > from.index ? 150 : -150);
  const animation = $derived.by(() => {
    if (from.index < 0 || to.index < 0) return {
      in: scaleFreeze,
      out: scaleFreeze,
      params: {
        in: { delay: 300, start: 0.99 } satisfies ScaleFreezeParams,
        out: { start: 0.99 } satisfies ScaleFreezeParams,
      },
    };
    return {
      in: to.transition ?? fly,
      out: from.transition ?? fly,
      params: {
        in: { x: `${direction}%`, duration: 500, easing: sineInOut, opacity: 1 } satisfies FlyParams,
        out: { x: `${-direction}%`, duration: 500, easing: sineInOut, opacity: 1 } satisfies FlyParams,
      },
    };
  });

  const transition: TransitionProps = $derived({
    ...animation,
    props: {
      container: {
        class: 'main-transition-container',
      },
      wrapper: {
        class: 'main-transition-wrapper',
      },
    },
    first: false,
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

    :global(> .main-transition-container),
    :global(> .main-transition-container > .main-transition-wrapper){
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
  }
</style>
