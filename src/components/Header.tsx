"use client";

import React from "react";
import { useAccount, useConnect } from "wagmi";

const Header: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const [isConnecting, setIsConnecting] = React.useState(false);

  const handleConnect = async () => {
    const metamaskConnector =
      connectors.find((c) => c.name === "MetaMask") ?? connectors[0];
    if (!metamaskConnector) return;
    try {
      setIsConnecting(true);
      await connectAsync({ connector: metamaskConnector });
    } finally {
      setIsConnecting(false);
    }
  };

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <header className="w-full border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-semibold">StakeYourTake</div>
        <div>
          {isConnected ? (
            <span className="inline-flex items-center rounded-md bg-neutral-100 dark:bg-neutral-900 px-3 py-1 text-sm font-medium">
              {truncatedAddress}
            </span>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="inline-flex items-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 disabled:opacity-60"
            >
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;


