<script lang="ts">
    import {goto} from "$app/navigation";
    import {wallet} from "$lib/stores/wallet";
    import {circles} from "$lib/stores/circles";
    import {avatar} from "$lib/stores/avatar";
    import {type CirclesConfig, Sdk} from "@circles-sdk/sdk";
    import {chiadoConfig, gnosisConfig} from "$lib/chiadoConfig";
    import {BrowserProviderContractRunner} from "@circles-sdk/adapter-ethers";
    import {onMount} from "svelte";

    // Import WalletConnect and Core packages
    import { Core } from '@walletconnect/core';
    import { Web3Wallet } from '@walletconnect/web3wallet';

    // Initialize WalletConnect Core and Web3Wallet
    const core = new Core({
        projectId: '07242efa96f3d913e0c963d785f2fe9e'
    });

    const metadata = {
        name: 'Circles 5ecret garden',
        description: 'AppKit Example',
        url: 'http://localhost:5175/', // origin must match your domain & subdomain
        icons: ['https://assets.reown.com/reown-profile-pic.png']
    };

    let web3wallet;
    let walletConnected = false;

    onMount(async () => {
        web3wallet = await Web3Wallet.init({
            core, // pass the shared core instance
            metadata
        });
    });

    //
    // Connects the wallet and initializes the Circles SDK.
    //
    async function connectWallet() {
        // Check if WalletConnect is ready
        if (!web3wallet) {
            console.error("WalletConnect not initialized");
            return;
        }

        // Establish connection with the specified methods and events
        try {
            const session = await web3wallet.connect({
                methods: [
                    "eth_accounts",
                    "eth_requestAccounts",
                    "eth_sendRawTransaction",
                    "eth_sign",
                    "eth_signTransaction",
                    "eth_signTypedData",
                    "eth_signTypedData_v3",
                    "eth_signTypedData_v4",
                    "eth_sendTransaction",
                    "personal_sign",
                    "wallet_switchEthereumChain",
                    "wallet_addEthereumChain",
                    "wallet_getPermissions",
                    "wallet_requestPermissions",
                    "wallet_registerOnboarding",
                    "wallet_watchAsset",
                    "wallet_scanQRCode",
                    "wallet_sendCalls",
                    "wallet_getCallsStatus",
                    "wallet_showCallsStatus",
                    "wallet_getCapabilities",
                ],
                events: [
                    "chainChanged",
                    "accountsChanged",
                    "message",
                    "disconnect",
                    "connect",
                ]
            });

            const walletAddress = session?.accounts[0]; 
            if (!walletAddress) {
                throw new Error('Failed to retrieve wallet address');
            }

            const wallet = new BrowserProviderContractRunner();
            await wallet.init();

            // Set the connected wallet in store
            $wallet = wallet;

            const network = await $wallet.provider?.getNetwork();
            if (!network) {
                throw new Error('Failed to get network');
            }
            const circlesConfig = await getCirclesConfig(network.chainId);

            // Initialize the Circles SDK
            $circles = new Sdk(circlesConfig, $wallet!);

            // Fetch avatar information
            const avatarInfo = await $circles.data.getAvatarInfo($wallet.address!);

            // If the wallet is registered, navigate to the dashboard
            if (avatarInfo) {
                $avatar = await $circles.getAvatar($wallet.address!);
                walletConnected = true;
                await goto("/_new/dashboard");
            } else {
                walletConnected = true;
                await goto("/_new/register");
            }
        } catch (error) {
            console.error("Failed to connect wallet", error);
        }
    }

    // Return the Circles configuration based on chain ID
    async function getCirclesConfig(chainId: bigint): Promise<CirclesConfig> {
        switch (chainId) {
            case 100n:
                return gnosisConfig;
            case 10200n:
                return chiadoConfig;
            default:
                throw new Error(`Unsupported chain-id: ${chainId}`);
        }
    }
</script>

<div class="hero bg-base-200 min-h-screen">
    <div class="hero-content flex-col lg:flex-row-reverse">

        <div class="card bg-base-100 w-96 shadow-xl">
            {#if !walletConnected}
                <figure class="px-10 pt-10">
                    <span class="loading loading-spinner loading-lg"></span>
                </figure>
                <div class="card-body items-center text-center">
                    <h2 class="card-title">Connect your WalletConnect wallet</h2>
                    <p>Please click the button below to connect your wallet</p>
                    <button class="btn btn-primary" on:click={connectWallet}>Connect Wallet</button>
                    <!-- <a href="/_new/connect-wallet" class="btn btn-warning mt-2">Cancel</a> -->
                </div>
            {:else}
                <div class="card-body items-center text-center">
                    <h2 class="card-title">Wallet Connected</h2>
                    <p>Your wallet has been successfully connected!</p>
                    <a href="/_new/dashboard" class="btn btn-success">Go to Dashboard</a>
                </div>
            {/if}
        </div>
    </div>
</div>
