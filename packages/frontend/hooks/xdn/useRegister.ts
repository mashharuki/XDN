import { useCallback, useState } from "react";
import { useWriteContract } from "wagmi";

interface RegisterParams {
  address: string;
  domain: string;
  years: number;
  domainPrice: bigint;
}

interface RegisterProps {
  deployedContractData: {
    address: string;
    abi: any[];
  };
}

interface RegisterResult {
  txHash: string;
  message: string;
}

export const useRegister = (props: RegisterProps) => {
  const [data, setData] = useState<RegisterResult | null>(null);
  const { writeContract, isPending, error, data: writeData } = useWriteContract();

  const register = useCallback(
    async (params: RegisterParams) => {
      try {
        const { address, domain, years, domainPrice } = params;
        const { deployedContractData } = props;

        console.log("address:", address);
        console.log("deployedContractData.address:", deployedContractData.address);
        console.log("Calling register method using useWriteContract...");
        console.log("Parameters:", { address, domain, years, domainPrice: domainPrice.toString() });

        // Call the register method using writeContract
        writeContract({
          address: deployedContractData.address as `0x${string}`,
          abi: deployedContractData.abi,
          functionName: "register",
          args: [address, domain, years],
          value: domainPrice,
        });

        console.log("Transaction submitted");
        console.log("writeData:", writeData);

        // Note: writeContract doesn't return a hash directly
        // The transaction hash will be available in writeData after the transaction is submitted
        const registerResult: RegisterResult = {
          txHash: writeData as string,
          message: "Registration submitted",
        };
        setData(registerResult);

        return registerResult;
      } catch (e: any) {
        console.error("err:", e);
        throw e;
      }
    },
    [props, writeContract, writeData],
  );

  return { register, isLoading: isPending, error, data };
};
