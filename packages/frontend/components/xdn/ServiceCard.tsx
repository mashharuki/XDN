"use client";

import { useEffect, useState } from "react";
import { Contract, ethers } from "ethers";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { POST } from "~~/app/api/requestRelayer/route";
import Loading from "~~/components/common/Loading";
import { useEthersSigner } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useCheckRegistered, usePrice } from "~~/hooks/xdn";
import { RPC_URL } from "~~/utils/constants";
import { getUint48 } from "~~/utils/helper";
import { ForwardRequest } from "~~/utils/types";

type ContractUIProps = {
  deployedContractData?: any;
  SampleForwarderContractData?: any;
};

/**
 * ServiceCard Components
 * @returns
 */
export const ServiceCard = ({ deployedContractData, SampleForwarderContractData }: ContractUIProps) => {
  const [domain, setDomain] = useState<string>();
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [years, setYears] = useState(1);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  const { targetNetwork } = useTargetNetwork();
  const { address } = useAccount();
  const { isPending } = useWriteContract();
  // get signer object
  const signer = useEthersSigner({ chainId: targetNetwork.id });

  // get checkRegistered hook
  const { registered, checkRegisterStatus } = useCheckRegistered(
    deployedContractData.address,
    deployedContractData.abi,
    domain as string,
  );
  // get price function
  const { domainPrice, getPrice } = usePrice(
    deployedContractData.address,
    deployedContractData.abi,
    domain as any,
    years,
  );

  /**
   * checkRegistered
   */
  const checkRegistered = async () => {
    await checkRegisterStatus();
    console.log("data:", registered);
    if (registered) {
      setIsAvailable(true);
      await updatePrice();
      toast.info(`This domain is available`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } else {
      setIsAvailable(false);
      toast.info(`This domain is available`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  /**
   * register
   */
  const register = async () => {
    try {
      console.log("address:", address);
      console.log("deployedContractData.address:", deployedContractData.address);

      // create Contract object
      const domains: any = new Contract(deployedContractData.address, deployedContractData.abi, signer) as any;
      const forwarder: any = new Contract(
        SampleForwarderContractData.address,
        SampleForwarderContractData.abi,
        signer,
      ) as any;
      // generate encoded data
      const data = domains.interface.encodeFunctionData("register", [address, domain, years]);
      // get EIP712 domain
      const eip721Domain = await forwarder.eip712Domain();
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      // get current block
      const currentBlock = await provider.getBlock("latest");
      const currentTime = currentBlock!.timestamp;
      // get deadline
      const uint48Time = await getUint48(currentTime);
      console.log("getUint48:", uint48Time);

      // creat metaTx request data
      const signature = await signer!.signTypedData(
        {
          name: eip721Domain.name,
          version: eip721Domain.version,
          chainId: eip721Domain.chainId,
          verifyingContract: eip721Domain.verifyingContract,
        },
        {
          ForwardRequest: ForwardRequest,
        },
        {
          from: address,
          to: domains.target,
          value: domainPrice!.toString(),
          gas: 9000000,
          nonce: await forwarder.nonces(address),
          deadline: uint48Time,
          data: data,
        },
      );

      console.log("signature:", signature);

      // call execute method from relayer
      await POST({
        request: {
          from: address,
          to: domains.target,
          value: domainPrice!.toString(),
          gas: 9000000,
          //nonce: await forwarder.nonces(address),
          deadline: uint48Time.toString(),
          data: data,
          signature: signature,
        },
      }).then(async result => {
        // APIリクエストのリザルトをJSONとして解析
        console.log("API response:", result);
        setTxHash(result.body.txHash);

        toast.success("🦄 Success!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      });
    } catch (err: any) {
      console.error("err:", err);
      toast.error("Failed....", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  /**
   * 有効期限を1年増やす
   */
  const increaseYears = async () => {
    if (years < 5) {
      setYears(years + 1);
    }
  };

  /**
   * 有効期限を1年減らす
   */
  const decreaseYears = async () => {
    if (years > 1) {
      setYears(years - 1);
    }
  };

  /**
   * updatePrice method
   */
  const updatePrice = async () => {
    await getPrice();
    console.log("price:", domainPrice);
  };

  useEffect(() => {
    updatePrice();
  }, [years]);

  return (
    <>
      {isPending ? (
        <Loading />
      ) : (
        <>
          <div className="relative items-center w-full px-5 py-12 mx-auto md:px-12 lg:px-24 max-w-7xl">
            <div className="grid grid-cols-1">
              <div className="w-full max-w-7xl mx-auto my-4 bg-white shadow-xl rounded-xl">
                <div className="p-6 lg:text-center">
                  <h4 className="mt-8 text-2xl font-semibold leading-none tracking-tighter text-neutral-600 lg:text-3xl">
                    Register Your domain
                  </h4>
                  <div className="mt-6 join">
                    <input
                      className="input input-bordered join-item"
                      placeholder="Enter Domain"
                      onChange={(e: any) => setDomain(e.target.value)}
                      value={domain}
                    />
                    <button className="btn join-item rounded-r-full" onClick={checkRegistered}>
                      Check
                    </button>
                  </div>
                  {isAvailable && (
                    <>
                      <div className="flex items-center justify-center mt-5">
                        <button className="btn" onClick={decreaseYears} disabled={years <= 1}>
                          -
                        </button>
                        <span className="mx-4 text-black">
                          {years} Year{years > 1 ? "s" : ""}
                        </span>
                        <button className="btn" onClick={increaseYears} disabled={years >= 5}>
                          +
                        </button>
                      </div>
                    </>
                  )}
                  {domainPrice != undefined && (
                    <>
                      <div className="mt-6 font-semibold leading-none tracking-tighter text-neutral-600">
                        Domain price: {formatEther(domainPrice as any)} XCR
                      </div>
                      <div className="mt-6">
                        <button
                          className="flex items-center justify-center w-full px-10 py-4 text-base font-medium text-center text-white transition duration-400 ease-in-out transform bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={register}
                        >
                          Register Your Domain
                        </button>
                      </div>
                    </>
                  )}
                  {txHash != undefined && (
                    <div className="mt-6">
                      <a target="_blank" href={`${targetNetwork.blockExplorers?.default.url}/tx/${txHash}`}>
                        <button className="flex items-center justify-center w-full px-10 py-4 text-base font-medium text-center text-white transition duration-400 ease-in-out transform bg-green-600 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                          Check Tx Data
                        </button>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
