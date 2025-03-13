"use client";

import { DomainCard } from "./DomainCard";
import "react-toastify/dist/ReactToastify.css";
import { useGetAllNames } from "~~/hooks/xdn";

type ContractUIProps = {
  deployedContractData?: any;
  filter: string;
};

/**
 * DomainCards Components
 * @returns
 */
export const DomainCards = ({ deployedContractData, filter }: ContractUIProps) => {
  const { names } = useGetAllNames(deployedContractData.address, deployedContractData.abi);

  /**
   * display cards
   */
  const displayCards = (names: any) => {
    return (
      <div className="flex flex-wrap m-auto">
        {names.map((name: any, index: number) => {
          return (
            <div className="" key={index}>
              <DomainCard id={index} name={name} deployedContractData={deployedContractData} filter={filter} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <>{names != undefined && <>{displayCards(names)}</>}</>
    </div>
  );
};
