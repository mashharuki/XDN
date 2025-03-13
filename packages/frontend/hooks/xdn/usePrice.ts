import { useCallback } from "react";
import { useTargetNetwork } from "../scaffold-eth/useTargetNetwork";
import { useReadContract } from "wagmi";

/**
 * hoook for fetching price data
 * @param address
 * @param abi
 * @param domain
 * @param years
 */
export function usePrice(address: `0x${string}`, abi: any[], domain: string, years: number) {
  const { targetNetwork } = useTargetNetwork();

  // get price function
  const { data: domainPrice, refetch: getPriceData } = useReadContract({
    address: address,
    functionName: "price",
    abi: abi,
    args: [domain as any, years],
    chainId: targetNetwork.id,
    query: {
      enabled: true,
      retry: true,
    },
  });

  /**
   * get price callback function
   */
  const getPrice = useCallback(async () => {
    await getPriceData();
    console.log("domainPrice:", domainPrice);
  }, []);

  return { domainPrice, getPrice };
}
