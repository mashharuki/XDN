"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import Loading from "~~/components/common/Loading";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useCheckRegistered, usePrice, useRegister } from "~~/hooks/xdn";

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
  // get register hook
  const { register, data } = useRegister({
    deployedContractData: {
      address: deployedContractData.address,
      abi: deployedContractData.abi,
    },
  });

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

  console.log("SampleForwarderContractData:", SampleForwarderContractData);

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
  const registerDomain = async () => {
    try {
      console.log("address:", address);
      console.log("deployedContractData.address:", deployedContractData.address);

      // reserve domain
      await register({
        address: deployedContractData.address,
        domain: domain as string,
        years: years,
        domainPrice: domainPrice as any,
      });

      console.log("Registering domain...");

      // get result
      console.log("register response:", data);
      setTxHash(data?.txHash);

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
                          onClick={registerDomain}
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
