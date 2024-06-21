<script lang="ts">
    import ActionButton from "$lib/components/ActionButton.svelte";
    import {goto} from "$app/navigation";
    import {circles} from "$lib/stores/circles";
    import {avatar} from "$lib/stores/avatar";
    import type {Avatar} from "@circles-sdk/sdk";

    async function registerV1Person() {
        if (!$circles) {
            throw new Error('Wallet not connected ($circles is undefined)');
        }

        $avatar = <Avatar>await $circles.registerHuman();

        // After signup, go to the dashboard
        goto("/dashboard");
    }

    async function registerV1Organization() {
        if (!$circles) {
            throw new Error('Wallet not connected ($circles is undefined)');
        }

        $avatar = <Avatar>await $circles.registerOrganization();

        // After signup, go to the dashboard
        goto("/dashboard");
    }
</script>

<div class="flex flex-col items-center justify-center h-full p-6 space-y-4">
    <h1 class="text-2xl font-bold mb-4">Register a new Account</h1>
    <p class="text-gray-700 mb-6 text-center">Click the button below to register your wallet at Circles.</p>

    <ActionButton action={registerV1Person}>
        Register as person (V1)
    </ActionButton>
    <ActionButton action={registerV1Organization}>
        Register as organization (V1)
    </ActionButton>
</div>