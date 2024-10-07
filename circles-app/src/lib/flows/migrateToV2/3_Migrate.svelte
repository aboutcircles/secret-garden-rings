<script lang="ts">
    import type {PopupContentApi} from "$lib/components/PopUp.svelte";
    import {onMount} from "svelte";
    import FlowDecoration from "$lib/flows/FlowDecoration.svelte";
    import type {MigrateToV2Context} from "$lib/flows/migrateToV2/context";
    import {runTask} from "../../../routes/+layout.svelte";
    import {circles} from "$lib/stores/circles";
    import {removeProfileFromCache} from "$lib/components/Avatar.svelte";
    import {avatar} from "$lib/stores/avatar";
    import { tokenTypeToString } from "$lib/pages/SelectAsset.svelte";

    onMount(async () => {
    });

    async function migrate() {
        if (!$circles || !$avatar?.address) {
            throw new Error("SDK or Avatar store not initialized");
        }

        const tokenAddress = $avatar.avatarInfo?.v1Token;

        if (!tokenAddress) {
            throw new Error("Token address not found.");
        }

        const tokenAddressStr = String(tokenAddress);  // Explicitly convert to string
        
        runTask({
            name: `Migrate to V2 Human Avatar`,
            // Pass the token address as a string
            promise: $circles.migrateV1Tokens($avatar.address, [tokenAddressStr])
        })
        .then(async () => {
            removeProfileFromCache($avatar!.address);
            $avatar!.avatarInfo!.version = 2;
            $avatar!.avatarInfo!.v1Stopped = true;
            $avatar = $avatar;
        });

        contentApi.close();
    }
</script>

<FlowDecoration>
    <p>
        You're ready to migrate to Circles V2! Click the button below to start the migration process.
    </p>
    <div class="flex justify-end space-x-2 mt-6">
        <button type="submit" class="btn btn-primary px-6 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600"
                on:click={() => migrate()}>
            Migrate to V2
        </button>
    </div>
</FlowDecoration>
