import { TransactionStatusResponse, TaskState } from "@gelatonetwork/relay-sdk";

export const fetchStatusSocket = async (
    status: TransactionStatusResponse,
    setMessage: any,
    setLoading: any
  ) => {
    setMessage({
      header: "Loading",
      body: undefined,
      taskId: undefined,
    })
  
    try {
      let details = {
        txHash: status?.transactionHash || undefined,
        chainId: status?.chainId?.toString() || undefined,
        blockNumber: status?.blockNumber?.toString() || undefined,
        executionDate: status?.executionDate || undefined,
        creationnDate: status?.creationDate || undefined,
        taskState: (status?.taskState as TaskState) || undefined,
      };
      let body = ``;
      let header = ``;
  
      let txHash = details.txHash;
      console.log(204, details.taskState);
  
      switch (details.taskState!) {
        case TaskState.WaitingForConfirmation:
          header = `Transaction Relayed`;
          body = `Waiting for Confirmation`;
          break;
        case TaskState.CheckPending:
          header = `Transaction Relayed`;
          body = `Simulating Transaction`;
  
          break;
        case TaskState.ExecPending:
          header = `Transaction Relayed`;
          body = `Pending Execution`;
          break;
        case TaskState.ExecSuccess:
          header = `Transaction Executed`;
          body = `Waiting to refresh...`;
  
     
          setTimeout(() => {
            console.log("finish");
            setLoading(false);
          }, 2000);
  
          break;
        case TaskState.Cancelled:
          header = `Canceled`;
          body = `TxHash: ${details.txHash}`;
         
          break;
        case TaskState.ExecReverted:
          header = `Reverted`;
          body = `TxHash: ${details.txHash}`;
        break;

        default:
          // ExecSuccess = "ExecSuccess",
          // ExecReverted = "ExecReverted",
          // Blacklisted = "Blacklisted",
          // Cancelled = "Cancelled",
          // NotFound = "NotFound",
          // destroyFetchTask.next();
          break;
      }
  
      setMessage({
        header,
        body,
        taskId: txHash,
      });
  
      // this.store.dispatch(
      //   Web3Actions.chainBusyWithMessage({
      //     message: {
      //       body: body,
      //       header: header,
      //     },
      //   })
      // );
    } catch (error) {}
  };