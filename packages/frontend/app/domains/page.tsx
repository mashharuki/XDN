"use client";

import { useState } from "react";
import type { NextPage } from "next";
import Toaster from "~~/components/common/Toaster";
import { DomainCards } from "~~/components/xdn/DomainCards";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

/**
 * Domains pages
 * @returns
 */
const Domains: NextPage = () => {
  const [filter, setFilter] = useState("all");

  const contractsData = getAllContracts();
  const contractNames = Object.keys(contractsData) as ContractName[];

  // get contractData
  const { data: deployedContractData } = useDeployedContractInfo(contractNames[0]);

  /**
   * プルダウンで選択した時に変更する。
   */
  const handleFilterChange = (event: any) => {
    setFilter(event.target.value);
  };

  return (
    <>
      <div className="flex flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">Minted All Domains</span>
          </h1>
          <div className="relative">
            <select
              className="bg-slate-600 text-white p-2 rounded-md shadow-md"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="all">All Domains</option>
              <option value="myDomains">My Domains</option>
            </select>
          </div>
        </div>
        {deployedContractData != undefined && (
          <div className="w-full justify-center">
            <DomainCards deployedContractData={deployedContractData} filter={filter} />
          </div>
        )}
      </div>
      <Toaster />
    </>
  );
};

export default Domains;
