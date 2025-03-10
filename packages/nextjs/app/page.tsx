"use client";

import { ServiceCard } from "../components/xdn/ServiceCard";
import type { NextPage } from "next";
import Toaster from "~~/components/common/Toaster";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { getAllContracts } from "~~/utils/scaffold-eth/contractsData";

/**
 * Home component
 * Domain Name Service Page
 * @returns
 */
const Home: NextPage = () => {
  const contractsData = getAllContracts();
  const contractNames = Object.keys(contractsData) as ContractName[];

  const { data: deployedContractData } = useDeployedContractInfo(contractNames[0]);
  const { data: SampleForwarderContractData } = useDeployedContractInfo(contractNames[1]);

  console.log("deployedContractData", deployedContractData);
  console.log("SampleForwarderContractData", SampleForwarderContractData);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10 w-full">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">XDN Service Page</span>
          </h1>
          {deployedContractData != undefined && SampleForwarderContractData != undefined && (
            <ServiceCard
              key={contractNames[0].toString()}
              deployedContractData={deployedContractData}
              SampleForwarderContractData={SampleForwarderContractData}
            />
          )}
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default Home;
