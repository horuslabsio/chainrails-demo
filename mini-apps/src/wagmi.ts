import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { http, createConfig } from "wagmi";
import {
  arbitrum,
  avalanche,
  base,
  bsc,
  hyperEvm,
  mainnet,
  monad,
  optimism,
  polygon,
} from "wagmi/chains";

export const config = createConfig({
  chains: [
    arbitrum,
    avalanche,
    base,
    bsc,
    hyperEvm,
    mainnet,
    monad,
    optimism,
    polygon,
  ],
  connectors: [miniAppConnector()],
  transports: {
    [arbitrum.id]: http(),
    [avalanche.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
    [hyperEvm.id]: http(),
    [optimism.id]: http(),
    [mainnet.id]: http(),
    [monad.id]: http(),
    [polygon.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
