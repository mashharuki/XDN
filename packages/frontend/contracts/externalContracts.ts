import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

/**
 * 外部のコントラクトを呼び出す場合はここにコントラクト名、アドレス、ABIを定義する
 * @example
 * const externalContracts = {
 *   1: {
 *     DAI: {
 *       address: "0x...",
 *       abi: [...],
 *     },
 *   },
 * } as const;
 */
const externalContracts = {} as const;

export default externalContracts satisfies GenericContractsDeclaration;
