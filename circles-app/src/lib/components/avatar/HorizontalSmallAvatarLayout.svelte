<script lang="ts">
  import type { Profile } from '@circles-sdk/profiles';

  export let profile: Profile | undefined;
  export let imageStyle: 'square' | 'circle' = 'circle';
  export let showName: boolean = true;
  export let trustVersion: number | undefined = undefined;
</script>

<div class="inline-flex items-center">
  <button class="cursor-pointer" on:click>
      <img
        src={profile?.previewImageUrl}
        alt="User Icon"
        class="w-6 h-6 object-cover"
        class:rounded-full={imageStyle === 'circle'}
      />
  </button>
  <div class="flex flex-col items-start pl-2 gap-y-0.5">
    {#if showName}
      <span class="font-medium text-sm text-neutral-900">{profile?.name}</span>
      <p class="flex flex-col items-start text-xs text-gray-500">
        <slot></slot>
      </p>
    {/if}
    {#if trustVersion}
      <p class="text-xs text-yellow-500">
        {trustVersion == 1 ? 'This relation was made before migration' : ''}
      </p>
    {/if}
  </div>
</div>
