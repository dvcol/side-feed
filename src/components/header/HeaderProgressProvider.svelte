<script lang="ts">
  import { useNeoProgressService } from '@dvcol/neo-svelte';
  import { onDestroy } from 'svelte';

  import { LoadingService } from '~/services/loading.service.svelte';

  LoadingService.init(useNeoProgressService());
  onDestroy(LoadingService.destroy);
</script>
