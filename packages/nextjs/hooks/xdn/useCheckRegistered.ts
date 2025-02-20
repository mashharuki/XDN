import { useCallback } from "react";
import { useTargetNetwork } from "../scaffold-eth/useTargetNetwork";
import { useReadContract } from "wagmi";

/**
 * Hook for checking if a user is registered
 * @param address
 * @param abi
 * @param domain
 */
export function useCheckRegistered(address: `0x${string}`, abi: any[], domain: string) {
  const { targetNetwork } = useTargetNetwork();

  // get checkRegistered function
  const { data: registered, refetch: checkRegister } = useReadContract({
    address: address,
    functionName: "checkRegistered",
    abi: abi,
    args: [domain as any],
    chainId: targetNetwork.id,
    query: {
      retry: true,
    },
  });

  /**
   * checkRegistered callback function
   */
  const checkRegisterStatus = useCallback(async () => {
    await checkRegister();
    console.log("register:", registered);
  }, []);

  return { registered, checkRegisterStatus };
}
