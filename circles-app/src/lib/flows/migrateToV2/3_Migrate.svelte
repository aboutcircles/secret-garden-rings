<script lang="ts">
    import type {PopupContentApi} from "$lib/components/PopUp.svelte";
    import {onMount} from "svelte";
    import FlowDecoration from "$lib/flows/FlowDecoration.svelte";
    import type {MigrateToV2Context} from "$lib/flows/migrateToV2/context";
    import {runTask} from "../../../routes/+layout.svelte";
    import {circles} from "$lib/stores/circles";
    import {avatar} from "$lib/stores/avatar";
    import {removeProfileFromCache} from "$lib/components/Avatar.svelte";
    import BalanceRow from "$lib/components/BalanceRow.svelte";
    import type {TokenBalanceRow} from "@circles-sdk/data";
    import {tokenTypeToString} from "$lib/pages/SelectAsset.svelte";

    export let contentApi: PopupContentApi;
    export let context: MigrateToV2Context;
    export let asset: TokenBalanceRow;

    // New variable for token amount input
    let tokenAmount = "";

    // On mount lifecycle
    onMount(async () => { });

    // Function to migrate avatar
    async function migrateAvatar() {
        if (!$circles || !$avatar?.address) {
            throw new Error("Sdk or Avatar store not initialized");
        }
        if (!context.profile) {
            throw new Error("Profile not initialized");
        }

        await runTask({
            name: `Migrating your Avatar ...`,
            promise: $circles.migrateAvatar($avatar.address, context.profile)
        });

        removeProfileFromCache($avatar!.address);
        $avatar!.avatarInfo!.version = 2;
        $avatar!.avatarInfo!.v1Stopped = true; // Stop V1 minting
        $avatar = $avatar;
    }

    // Function to migrate specific V1 tokens
    async function migrateV1Tokens() {
        if (!$circles || !$avatar?.address) {
            throw new Error("Sdk or Avatar store not initialized");
        }

        // Fetch token info to validate
        const tokenInfo = await $circles?.data?.getTokenInfo(asset.tokenAddress);
        if (!tokenInfo) {
            throw new Error("Token info is not available");
        }
        if (tokenInfo.version !== 1) {
            throw new Error(`Token ${tokenInfo.token} is not a V1 token and can't be migrated.`);
        }

        // Parse token amount and validate it
        const amount = parseInt(tokenAmount, 10);
        if (isNaN(amount) || amount <= 0) {
            throw new Error("Please enter a valid token amount to migrate.");
        }

        // Run the migration task for the specific token amount
        await runTask({
            name: `Migrating ${tokenAmount} of ${tokenTypeToString(asset.tokenType)} to V2...`,
            promise: $circles.migrateV1Tokens($avatar.address, [asset.tokenAddress]) // Assumes this handles the amount internally
        });

        contentApi.close();
    }

    // Combined migration function for avatar and tokens
    async function migrate() {
        await migrateAvatar(); // Migrate avatar
        await migrateV1Tokens(); // Migrate specified tokens
    }
</script>

<FlowDecoration>
    <p>
        You're ready to migrate to Circles V2! 
        Enter the amount of V1 tokens you want to migrate below, or leave it blank to migrate all tokens.
        Click the button to start the migration process.
    </p>

    <!-- Input field for token amount (optional) -->
    <div class="flex flex-col mt-4">
        <label for="tokenAmount" class="mb-2 text-sm font-medium">Enter token amount to migrate:</label>
        <input
            id="tokenAmount"
            type="number"
            min="0"
            bind:value={tokenAmount}
            placeholder="Enter amount"
            class="input input-primary px-4 py-2 border rounded-md"
        />
    </div>

    <div class="flex justify-end space-x-2 mt-6">
        <button type="submit" class="btn btn-primary px-6 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600"
                on:click={() => migrate()}>
            Migrate to V2
        </button>
    </div>
</FlowDecoration>
