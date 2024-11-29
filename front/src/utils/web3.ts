import { useAppKitProvider } from "@reown/appkit/vue";
import { BrowserProvider, Eip1193Provider, verifyMessage } from "ethers";
import { session } from "../store";

export const signMessage = async (message: string): Promise<string> => {
  const { walletProvider } = useAppKitProvider('eip155');
  const provider = new BrowserProvider(walletProvider as Eip1193Provider);
  const signer = await provider.getSigner();
  if (!provider || !signer) throw new Error('No active account to sign with');
  const hashed = await signer.signMessage(message);
  session.activeNonce.value = message;
  session.activeSig.value = hashed;
  return hashed;
};

export const isSigner = (address: string, message: string, signature: string): boolean => {
  return verifyMessage(message, signature) === address;
};
