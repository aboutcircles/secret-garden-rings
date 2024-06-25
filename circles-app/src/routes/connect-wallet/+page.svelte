<script lang="ts">
    import ActionButton from "$lib/components/ActionButton.svelte";
    import {goto} from "$app/navigation";
    import {wallet} from "$lib/stores/wallet";
    import {circles} from "$lib/stores/circles";
    import {BrowserProvider, ethers} from "ethers";
    import {avatar} from "$lib/stores/avatar";
    import {type ProviderWithMetadata, Sdk} from "@circles-sdk/sdk";
    import {chainConfig} from "$lib/chainConfig";
    import {SafeAppProvider} from '@safe-global/safe-apps-provider';
    import SafeAppsSDK from '@safe-global/safe-apps-sdk';

    //
    // Gets the browser provider from the window object.
    //
    async function getBrowserProvider(): ProviderWithMetadata {
        const w: any = window;
        if (!w.ethereum) {
            throw new Error('No browser wallet found (window.ethereum is undefined)');
        }
        const provider = new BrowserProvider(w.ethereum);
        const signer = await provider.getSigner();

        return {
            provider: provider,
            address: await signer.getAddress()
        }
    }

    async function getSafeAppProvider(): ProviderWithMetadata {
        type Opts = {
            allowedDomains?: RegExp[];
            debug?: boolean;
        };

        const opts: Opts = {
            allowedDomains: [/^app\.safe\.global$/],
            debug: true,
        };

        const appsSdk = new SafeAppsSDK(opts);
        const provider = new SafeAppProvider(appsSdk.safe, appsSdk);
        const safeInfo = await appsSdk.safe.getInfo();

        return {
            provider: new BrowserProvider(provider),
            address: safeInfo.safeAddress
        };
    }

    async function initializeSdk() {
        // The circles sdk must be initialized with the
        // contract addresses and endpoints for the chain.
        // It takes a signer as the second argument.
        return new Sdk(chainConfig, $wallet!);
    }

    //
    // Connects the wallet and initializes the Circles SDK.
    //
    async function connectWallet() {
        const provider = await getSafeAppProvider();

        // Set the signer as $connectedWallet to make it globally available.
        $wallet = await provider;

        // Initialize the Circles SDK and set it as $circles to make it globally available.
        $circles = await initializeSdk();

        const avatarInfo = await $circles.data.getAvatarInfo($wallet.address);

        // If the signer address is already a registered Circles wallet, go straight to the dashboard.
        if (avatarInfo) {
            $avatar = await $circles.getAvatar(walletAddress);
            await goto("/dashboard");
        } else {
            await goto("/register");
        }
    }
</script>
<div class="flex flex-col items-center justify-center h-full p-6 space-y-4">
    <h1 class="text-2xl font-bold mb-4">Connect Your Wallet</h1>
    <p class="text-gray-700 mb-6 text-center">Please connect your wallet to continue.</p>

    <ActionButton action={connectWallet}>
        Connect Metamask
    </ActionButton>
</div>