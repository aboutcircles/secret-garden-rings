<script lang="ts" context="module">
  import { CirclesQuery, type TransactionHistoryRow } from "@circles-sdk/data";
  import type { SvelteComponent } from "svelte";

  export interface RowItem {
    [key: string]: any;
  }

  export interface ListProps<TRow extends TransactionHistoryRow> {
    rowComponent: typeof SvelteComponent;
    query: CirclesQuery<TRow> | null;
  }
</script>

<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { get } from "svelte/store";
  import { avatar } from "$lib/stores/avatar.js";

  const eventDispatcher = createEventDispatcher();

  export let rowComponent: typeof SvelteComponent;
  export let query: CirclesQuery<TransactionHistoryRow> | null = null;
  let rows: RowItem[] = [];
  let observer: IntersectionObserver;
  let pageEndMarker: HTMLLIElement;
  let unsubscribe: () => void;
  let pageNo = 0;

  async function loadInitialPage() {
    if (!query) return;

    const resultRows = query.currentPage?.results ?? [];
    rows = [...rows, ...resultRows];
    console.log(`Initial load: ${resultRows.length} results`, resultRows);
  }

  async function loadNextPage() {
    if (!query) return;
    const hasMorePages = await query.queryNextPage();
    if (hasMorePages) {
      const newRows = query.currentPage?.results ?? [];
      rows = [...rows, ...newRows];
      console.log(`Page ${pageNo++}: ${newRows.length} results`);
    } else {
      observer.disconnect();
    }
  }

  async function refresh() {
    const avatarValue = get(avatar);
    if (!avatarValue) return;
    const latestQuery = await avatarValue.getTransactionHistory(1);
    const latestRows = latestQuery.currentPage?.results ?? [];
    if (latestRows.length > 0) {
      const existingIds = new Set(rows.map((row) => row.transactionHash));
      const uniqueNewRows = latestRows.filter(
        (row) => !existingIds.has(row.transactionHash)
      );
      rows = [...uniqueNewRows, ...rows];
      console.log("Refreshed with new rows:", uniqueNewRows);
    }
  }

  onMount(async () => {
    await loadInitialPage();

    observer = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && query) {
        await loadNextPage();
      }
    });

    if (pageEndMarker) {
      observer.observe(pageEndMarker);
    }
  });

  $: {
    const avatarValue = get(avatar);
    if (avatarValue?.events) {
      if (unsubscribe) unsubscribe();
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

  function onItemClick(item: RowItem, index: number) {
    eventDispatcher("itemClick", { item, index });
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
