"use client";

import { useEffect } from "react";
import { DomainCard } from "./DomainCard";
import "react-toastify/dist/ReactToastify.css";
import { useAccount, useReadContract } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

type ContractUIProps = {
  deployedContractData?: any;
  filter: string;
};

/**
 * DomainCards Components
 * @returns
 */
export const DomainCards = ({ deployedContractData, filter }: ContractUIProps) => {
  const { targetNetwork } = useTargetNetwork();

  const { data: names, refetch } = useReadContract({
    address: deployedContractData.address,
    functionName: "getAllNames",
    abi: deployedContractData.abi,
    args: [],
    chainId: targetNetwork.id,
    query: {
      enabled: false,
      retry: false,
    },
  });

  /**
   * display cards
   */
  const displayCards = (names: any) => {
    return (
      <div className="flex flex-wrap -m-2">
        {names.map((name: any, index: number) => {
          return (
            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2" key={index}>
              <DomainCard id={index} name={name} deployedContractData={deployedContractData} filter={filter} />
            </div>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    const init = async () => {
      await refetch();
    };
    init();
  }, []);

  return (
    <div>
      <>{names != undefined && <>{displayCards(names)}</>}</>
    </div>
  );
};
