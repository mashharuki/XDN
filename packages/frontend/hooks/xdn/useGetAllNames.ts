import { useEffect } from "react";
import { useTargetNetwork } from "../scaffold-eth/useTargetNetwork";
import { useReadContract } from "wagmi";

/**
 * hoook for fetching price data
 * @param address
 * @param abi
 */
export function useGetAllNames(address: `0x${string}`, abi: any[]) {
  const { targetNetwork } = useTargetNetwork();

  // get ALL names
  const { data: names, refetch } = useReadContract({
    address: address,
    functionName: "getAllNames",
    abi: abi,
    args: [],
    chainId: targetNetwork.id,
    query: {
      enabled: true,
      retry: true,
    },
  });

  /**
   * getAllNames function
   */
  const getAllNames = useEffect(() => {
    refetch();
    console.log("names:", names);
  }, []);

  return { names, getAllNames };
}
