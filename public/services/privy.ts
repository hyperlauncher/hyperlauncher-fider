import { PrivyClientConfig } from "@privy-io/react-auth"

export const privyConfig: PrivyClientConfig = {
  loginMethods: ["email", "wallet", "google", "twitter"],
  appearance: {
    loginMessage: "Welcome to Hyperlauncher.ai",
    theme: "light",
    accentColor: "#676FFF",
  },
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
  },
}
