<script lang="ts">
  import Send from '$lib/pages/Send.svelte';
  import type { SendFlowContext } from '$lib/flows/send/context';
  import FlowDecoration from '$lib/flows/FlowDecoration.svelte';
  import { runTask } from '$lib/utils/tasks';
  import { roundToDecimals } from '$lib/utils/shared';
  import { avatar } from '$lib/stores/avatar';
  import { ethers } from 'ethers';
  import { popupControls } from '$lib/stores/popUp';

  interface Props {
    context: SendFlowContext;
  }

  let { context }: Props = $props();

  function onselect() {
    if (!$avatar) {
      throw new Error('Avatar not found');
    }
    if (!context.selectedAddress) {
      throw new Error('No address selected');
    }
    if (!context.selectedAsset) {
      throw new Error('No asset selected');
    }
    if (!context.amount) {
      throw new Error('No amount specified');
    }

    const collateral = [context.selectedAsset!.tokenOwner];
    const amounts = [ethers.parseEther(context.amount!.toString())];
    const data = Uint8Array.of(0);

    runTask({
      name: `Minting ${roundToDecimals(context.amount)} Group Circles ...`,
      promise: $avatar.groupMint(
        context.selectedAddress!,
        collateral,
        amounts,
        data
      ),
    });
    popupControls.close();
  }
</script>

<FlowDecoration>
  <p class="text-2xl font-bold">Confirm Transaction</p>
  <p class="text-gray-500 mt-2">
    Following CRC will be converted to a groups CRC
  </p>
  <Send
    asset={context.selectedAsset}
    amount={context.amount}
    receiverAddress={context.selectedAddress}
    textButton="Convert CRC"
    {onselect}
  />
</FlowDecoration>
