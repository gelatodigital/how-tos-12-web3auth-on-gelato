import { defineChain } from "viem";
export const RAAS_NETWORKS: any = {
  blueberry: {
    config: defineChain({
      id: 88153591557,
      network: "blueberry",
      name: "Arbitrum Orbit Blueberry",
      nativeCurrency: {
        name: "CGT",
        symbol: "CGT",
        decimals: 18,
      },
      rpcUrls: {
        public: {
          http: ["https://rpc.arb-blueberry.gelato.digital"],
        },
        default: {
          http: ["https://rpc.arb-blueberry.gelato.digital"],
        },
      },
      blockExplorers: {
        default: {
          name: "Block Scout",
          url: "https://arb-blueberry.gelatoscout.com/",
        },
      },
      contracts: {
      },
      testnet: true,
    }),
    privyId: "clozhep2500gal50f4c2j9gan",
    zeroDevId: "ZERODEV ID",
    simpleCounter: "0xEEeBe2F778AA186e88dCf2FEb8f8231565769C27",
  },
  raspberry: {
    config: defineChain({
      id: 123420111,
      network: "raspberry",
      name: "Op Celestia Raspberry",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: {
        public: {
          http: ["https://rpc.opcelestia-raspberry.gelato.digital"],
        },
        default: {
          http: ["https://rpc.opcelestia-raspberry.gelato.digital"],
        },
      },
      blockExplorers: {
        default: {
          name: "Block Scout",
          url: "https://opcelestia-raspberry.gelatoscout.com/",
        },
      },
      contracts: {
      },
      testnet: true,
    }),
    simpleCounter: "0xEEeBe2F778AA186e88dCf2FEb8f8231565769C27",
  },
  blackberry: {
    config: defineChain({
      id: 94204209,
      network: "blackberry",
      name: "Polygon CDK blackberry",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: {
        public: {
          http: ["https://rpc.polygon-blackberry.gelato.digital"],
        },
        default: {
          http: ["https://rpc.polygon-blackberry.gelato.digital"],
        },
      },
      blockExplorers: {
        default: {
          name: "Block Scout",
          url: "https://polygon-blackberry.gelatoscout.com/",
        },
      },
      contracts: {
      },
      testnet: true,
    }),

    simpleCounter: "0xEEeBe2F778AA186e88dCf2FEb8f8231565769C27",
  },
};
