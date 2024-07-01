<script lang="ts" context="module">
  import type { CirclesQuery, EventRow } from "@circles-sdk/data";
  import type { SvelteComponent } from "svelte";

  export interface RowItem {
    [key: string]: any;
  }

  export interface ListProps<TRow extends EventRow> {
    rowComponent: typeof SvelteComponent;
    query: CirclesQuery<TRow>;
  }
</script>

<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { avatar } from "$lib/stores/avatar.js"; // Ensure this path is correct
  import type { Avatar } from "@circles-sdk/sdk";

  const eventDispatcher = createEventDispatcher();

  export let rowComponent: typeof SvelteComponent;
  export let query: CirclesQuery<EventRow>;
  let rows: RowItem[] = [];
  let observer: IntersectionObserver;
  let pageEndMarker: HTMLLIElement;
  let unsubscribe: () => void;

  async function fetchInitialPage() {
    if (query.currentPage && query.currentPage.results) {
      rows = query.currentPage.results;
    } else {
      await fetchNextPage(); // Initial page load if no currentPage
    }
  }

  async function fetchNextPage() {
    if (!query) return;
    try {
      const hasNextPage = await query.queryNextPage();
      if (hasNextPage && query.currentPage && query.currentPage.results) {
        const newRows = query.currentPage.results;
        rows = [...rows, ...newRows]; // Append new rows to existing rows
      }
    } catch (error) {
      console.error("Error fetching next page:", error);
    }
  }

  async function refresh() {
    try {
      const result = await query.queryNextPage(); // Fetch the latest page
      if (result && result.currentPage && result.currentPage.results) {
        const newRows = result.currentPage.results;
        rows = [...rows, ...newRows]; // Prepend new rows to existing rows
      }
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    }
  }

  onMount(async () => {
    await fetchInitialPage(); // Fetch the initial page on mount

    observer = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting) {
        await fetchNextPage();
      }
    });

    if (pageEndMarker) {
      observer.observe(pageEndMarker);
    }
  });

  $: {
    const avatarValue: Avatar | undefined = $avatar;
    if (avatarValue?.events) {
      if (unsubscribe) unsubscribe(); // Unsubscribe from previous subscription
      unsubscribe = avatarValue.events.subscribe(async (event) => {
        if (
          event.$event !== "CrcV1_Transfer" &&
          event.$event !== "CrcV2_TransferSingle" &&
          event.$event !== "CrcV2_TransferBatch"
        ) {
          return;
        }
        await refresh();
      });
    }
  }
</script>

<ul class="space-y-3">
  {#each rows as row, index}
    <li
      class="bg-white p-3 rounded shadow flex items-center cursor-pointer"
      on:click={() => onItemClick(row, index)}
    >
      <svelte:component this={rowComponent} {row} />
    </li>
  {/each}
  <li bind:this={pageEndMarker} class="h-1"></li>
</ul>
