import { useEffect, useState } from "react";
import { Status, State, TaskState, Message } from "../../types/Status";
import { BiRefresh, BiCopy } from "react-icons/bi";
import { interval, Subject, takeUntil } from "rxjs";
import {} from "ethers";
import web3AuthLogo from "../../assets/images/web-3-auth-logo-dark.svg";
import {
  CHAIN_NAMESPACES,
  WALLET_ADAPTERS,
  CustomChainConfig,
} from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { Dropdown } from "react-dropdown-now";
import "react-dropdown-now/style.css";
import Header from "../Header";
import "./style.css";
import axios from "axios";
import Loading from "../Loading";
import Button from "../Button";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useParams,
  useNavigate,
} from "react-router-dom";
import "./globals";
import { ethers, Signer, Contract } from "ethers";
import { LivenessEmbed } from "@web3auth/kyc-embed";

import { counterAbi } from "../../assets/contracts/counterAbi";

import "react-dropdown-now/style.css";

import { RAAS_NETWORKS } from "../../networks";
import { GELATO_KEY } from "../../constants";
import {
  CallWithERC2771Request,
  GelatoRelay,
  SignerOrProvider,
} from "@gelatonetwork/relay-sdk";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { fetchStatusSocket } from "./task";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

const App = () => {
  const navigate = useNavigate();

  const embedInstance = new LivenessEmbed({
    web3AuthClientId:
      "BFolnrXUpJ8WScbI0MHGllgsP4Jgyy9tuAyfd4rLJ0d07b1iGMhZw3Eu2E10HECY2KIqYczag4_Z4q7KsEojUWU",
    web3AuthNetwork: "sapphire_devnet",
  });

  const query = useQuery();
  let networkSearch = query.get("network");

  if (networkSearch == null || RAAS_NETWORKS[networkSearch] == undefined) {
    networkSearch = "blueberry";
  }

  let network = RAAS_NETWORKS[networkSearch!];

  const targetAddress = network.simpleCounter;
  const GELATO_RELAY_API_KEY = GELATO_KEY[networkSearch!];
  const rollups: string[] = ["blueberry", "raspberry", "blackberry"];

  const [counterContract, setCounterContract] = useState<Contract>();
  const [ready, setReady] = useState(false);
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<Message>({
    header: "Loading",
    body: undefined,
    taskId: undefined,
  });
  const [counter, setCounter] = useState<string>("Loading");
  const [liveness, setLiveness] = useState<boolean>(false);
  const [signerAddress, setSignerAddress] = useState<string | null>(null);

  const [connectStatus, setConnectStatus] = useState<Status | null>({
    state: State.missing,
    message: "Loading",
  });

  const selectRollup = async (network: any) => {
   
    navigate(`/?network=${network.value}`);
  };

  const cb = async (method: string, params?: any) => {
  
    if (method === "on_cancelled_liveness") {
      console.log("user has cancelled the liveness check before finished");
      // do your thing
    } else if (method == "on_complete_liveness") {
      let isAlive = params.result == "Success" ? true : false;

      if (isAlive) {
        setLiveness(true);
      }
    }
  };

  const onLiveness = async () => {
    setLoading(true);
    setConnectStatus({
      state: State.failed,
      message: "Waiting for Disconnection",
    });

    if (!embedInstance.isInitialized) {
    
      await embedInstance.init();
      embedInstance.subscribeEvents(cb);
    }

    embedInstance.initLivenessCheck({
      // this field is intended for the usage before login
      // setting this to `true` will allow users to access the liveness check without logging in
      // for the liveness check usage after login, please see the next section
      allowUnauthenticatedAccess: true,
    });
    setLoading(false);
  };

  const onDisconnect = async () => {
    setLoading(true);
    setConnectStatus({
      state: State.failed,
      message: "Waiting for Disconnection",
    });
    await web3auth?.logout();
    setLoading(false);
  };

  const onConnect = async () => {
    try {
      console.log(web3auth);

      const web3authProvider = await web3auth!.connect();

      const provider = new ethers.BrowserProvider(web3authProvider!);
      setWeb3auth(web3auth);
      refresh(provider);

      return;
    } catch (error) {}
  };

  const onCopy = async (text: string) => {
    if ("clipboard" in navigator) {
      await navigator.clipboard.writeText(text);
    } else {
      document.execCommand("copy", true, text);
    }
    alert("Copied to Clipboard");
  };

  const onAction = async (action: number) => {
    switch (action) {
      case 0:
        increment();

        break;

      default:
        setLoading(false);
        break;
    }
  };

  const increment = async () => {
    try {
      setMessage({
        header: "Waiting for tx...",
        body: undefined,
        taskId: undefined,
      });
      setLoading(true);

      let tmpCountercontract = await getCounterContract(provider!);
      const { data: dataCounter } =
        await tmpCountercontract!.increment.populateTransaction();
      const chainId = (await provider!.getNetwork()).chainId;

      const relay = new GelatoRelay();
      const request: CallWithERC2771Request = {
        chainId,
        target: targetAddress,
        data: dataCounter as string,
        user: signerAddress as string,
      };

      const response = await relay.sponsoredCallERC2771(
        request,
        signer! as unknown as SignerOrProvider,
        GELATO_RELAY_API_KEY as string
      );
      console.log(
        `https://relay.gelato.digital/tasks/status/${response.taskId}`
      );

      const relayStatusWs = new WebSocket(
        "wss://api.gelato.digital/tasks/ws/status"
      );
      relayStatusWs.onopen = (event) => {
        relayStatusWs.send(
          JSON.stringify({
            action: "subscribe" as string,
            taskId: response.taskId,
          })
        );
        relayStatusWs.onmessage = (event) => {
          fetchStatusSocket(
            JSON.parse(event.data).payload,
            setMessage,
            setLoading
          );
        };
      };
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const doRefresh = async () => {
    setMessage({
      header: "Checking Safes....",
      body: undefined,
      taskId: undefined,
    });
    setLoading(true);
    await refresh(provider!);
  };

  const refresh = async (provider: ethers.BrowserProvider) => {
    setProvider(provider);

    const signer = await provider?.getSigner();
    const signerAddress = (await signer?.getAddress()) as string;
    setSignerAddress(signerAddress);
    setSigner(signer);
    setConnectStatus({
      state: State.success,
      message: "Connection Succeed",
    });
    await getCounter(provider);
    setLoading(false);
  };

  const getCounterContract = async (provider: ethers.BrowserProvider) => {
    if (counterContract == undefined) {
      const signer = await provider?.getSigner();
      const counterAddress = targetAddress;
      const _counterContract = new Contract(counterAddress, counterAbi, signer);

      setCounterContract(counterContract);
      return _counterContract;
    } else {
      return counterContract;
    }
  };

  const getCounter = async (provider: ethers.BrowserProvider) => {
    const contract = await getCounterContract(provider);

    const balance = await contract.counter();

    setCounter(balance.toString());
  };
  function useQuery() {
    // Use the URLSearchParams API to extract the query parameters
    // useLocation().search will have the query parameters eg: ?foo=bar&a=b
    return new URLSearchParams(useLocation().search);
  }

  useEffect(() => {
    (async () => {
      if (web3auth == null) {
        const chainConfig: CustomChainConfig = {
          chainNamespace: "eip155",
          chainId: ethers.toBeHex(network.config.id),
          rpcTarget: network.config.rpcUrls.default.http,
          // Avoid using public rpcTarget in production.
          // Use services like Infura, Quicknode etc
          displayName: network.config.name as string,
          blockExplorerUrl: network.config.blockExplorers.default.url,
          ticker: "ETH",

          tickerName: "ETH",
        };

        const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });

        const web3authInstance = new Web3Auth({
          clientId:
            "BFolnrXUpJ8WScbI0MHGllgsP4Jgyy9tuAyfd4rLJ0d07b1iGMhZw3Eu2E10HECY2KIqYczag4_Z4q7KsEojUWU", // get it from Web3Auth Dashboard
          web3AuthNetwork: "sapphire_devnet",
          uiConfig: {
            appName: "On Gelato Web3Auth",
            mode: "dark",
            theme: {
              primary: "#f5c2a5",
            },
          },
          privateKeyProvider: ethereumPrivateKeyProvider,
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            //clientId, //Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
            network: "sapphire_mainnet", // Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
            uxMode: "popup",
            whiteLabel: {
              appName: "W3A Heroes",
              appUrl: "https://on-gelato-web3auth.web.app/",
              logoLight: "https://raas.gelato.network/images/GelatoLogo.svg",
              logoDark: "https://raas.gelato.network/images/GelatoLogo.svg",
              defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl, tr
              mode: "dark", // whether to enable dark mode. defaultValue: auto
              theme: {
                primary: "#00D1B2",
              },
              useLogoLoader: true,
            },
          },
        });
        await web3authInstance.configureAdapter(openloginAdapter);

        await web3authInstance!.initModal({
          modalConfig: {
            // Disable TORUS
            [WALLET_ADAPTERS.TORUS_EVM]: {
              label: "torus",
              showOnModal: false,
            },
          },
        });
        setWeb3auth(web3authInstance);
      }

      if (provider != null) {
        return;
      }
      if (networkSearch == null || RAAS_NETWORKS[networkSearch] == undefined) {
        navigate("/?network=blueberry");
      }

      setConnectStatus({
        state: State.failed,
        message: "Waiting for Disconnection",
      });
    })();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <Header
          status={connectStatus}
          ready={ready}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          signerAddress={signerAddress}
        />
        <Routes>
          <Route
            path="/"
            element={
              <div>
                {liveness ? (
                  <div>
                    {connectStatus?.state! == State.success && (
                      <div>
                        {loading && (
                          <Loading message={message} network={network} />
                        )}
                        <main>
                          <div className="flex">
                            <p className="title">
                              We3Auth on {network.config.name}
                            </p>
                            {signerAddress != undefined ? (
                              <div className="isDeployed">
                                <p>User:</p>
                                <p className="highlight">
                                  <a
                                    href={`${network.config.blockExplorers.default.url}/address/${signerAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {signerAddress.substring(0, 6) +
                                      "..." +
                                      signerAddress.substring(
                                        signerAddress.length - 6,
                                        signerAddress.length
                                      )}
                                    <span
                                      style={{
                                        position: "relative",
                                        top: "5px",
                                        left: "5px",
                                      }}
                                    >
                                      <BiCopy
                                        cursor={"pointer"}
                                        color="white"
                                        fontSize={"20px"}
                                        onClick={() => onCopy(signerAddress!)}
                                      />
                                    </span>
                                  </a>
                                </p>

                                <div>
                                  <p style={{ fontWeight: "600" }}>
                                    Counter:
                                    <span
                                      style={{
                                        marginLeft: "10px",
                                        fontSize: "15px",
                                      }}
                                      className="highlight"
                                    >
                                      {counter}
                                      <span
                                        style={{
                                          position: "relative",
                                          top: "5px",
                                        }}
                                      >
                                        <BiRefresh
                                          color="white"
                                          cursor={"pointer"}
                                          fontSize={"20px"}
                                          onClick={doRefresh}
                                        />
                                      </span>
                                    </span>
                                  </p>
                                  <p className="highlight">
                                    <a
                                      href={`${network.config.blockExplorers.default.url}/address/${network.simpleCounter}?tab=read_contract`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {network.simpleCounter.substring(0, 6) +
                                        "...." +
                                        network.simpleCounter.substring(
                                          network.simpleCounter.length - 6,
                                          network.simpleCounter.length
                                        )}
                                      <span
                                        style={{
                                          position: "relative",
                                          top: "5px",
                                          left: "5px",
                                        }}
                                      >
                                        <BiCopy
                                          cursor={"pointer"}
                                          color="white"
                                          fontSize={"20px"}
                                          onClick={() =>
                                            onCopy(network.simpleCounter)
                                          }
                                        />
                                      </span>
                                    </a>
                                  </p>
                                  <Button
                                    ready={ready}
                                    onClick={() => onAction(0)}
                                  >
                                    {" "}
                                    Increment
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div></div>
                            )}
                          </div>
                        </main>
                      </div>
                    )}{" "}
                    {connectStatus?.state! == State.missing && (
                      <p style={{ textAlign: "center" }}>Metamask not Found</p>
                    )}
                    {(connectStatus?.state == State.pending ||
                      connectStatus?.state == State.failed) && (
                      <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <div style={{ width: "300px", margin: "0 auto 30px" }}>
                          <h4 style={{ margin: "5px auto 5px" }}>
                            {" "}
                            Choose Your Gelato RollUp
                          </h4>
                          <Dropdown
                            placeholder="Select an option"
                            options={rollups}
                            value={networkSearch}
                            onSelect={(value: any) => selectRollup(value)}
                          />
                        </div>
                        <h3 style={{ margin: "5px auto 5px" }}>
                          {" "}
                          Please Sign In
                        </h3>
                        <Button
                          status={connectStatus}
                          ready={ready}
                          onClick={onConnect}
                        >
                          <span style={{ position: "relative", top: "0px" }}>
                            Sign In
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ textAlign: "center", marginTop: "80px" }}>
                      <h2 style={{ margin: "5px auto 30px" }}>
                        {" "}
                        Are you alive?
                      </h2>
                      <p>Liveness check powered by</p>
                      <img
                        style={{ margin: "5px auto 30px" }}
                        src={web3AuthLogo}
                        width={150}
                      />
                      <Button
                        status={connectStatus}
                        ready={ready}
                        onClick={onLiveness}
                      >
                        <span style={{ position: "relative", top: "0px" }}>
                          Check
                        </span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            }
          ></Route>
        </Routes>
      </div>
    </div>
  );
};

export default App;
