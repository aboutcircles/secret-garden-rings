<script lang="ts">
  import ActionButton from "$lib/components/ActionButton.svelte";
  import List from "$lib/components/List.svelte";
  import TransactionRow from "./components/TransactionRow.svelte";
  import { onMount } from "svelte";
  import { avatar } from "$lib/stores/avatar.js";
  import type { CirclesQuery, TransactionHistoryRow } from "@circles-sdk/data";

  let query: CirclesQuery<TransactionHistoryRow> | null = null;

  onMount(async () => {
    query = await $avatar?.getTransactionHistory(25);
  });

  async function mintCircles() {
    await $avatar?.personalMint();
  }
</script>

<div class="flex justify-between items-center mb-4">
  <ActionButton action={mintCircles}>Mint Circles</ActionButton>
</div>

{#if query}
  <List {query} rowComponent={TransactionRow} />
{/if}
