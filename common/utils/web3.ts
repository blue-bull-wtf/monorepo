import { verifyMessage } from "ethers";

export const isSigner = (address?: string, message?: string, sig?: string): boolean =>
  !!address && !!message && !!sig && verifyMessage(message, sig) === address;
