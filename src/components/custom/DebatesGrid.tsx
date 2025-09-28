"use client"

import { useDebateContractData } from "@/hooks/useDebateContractData";
import AddressName from "@/components/custom/AddressName";
import { useConfig } from "wagmi";
import { useRouter } from "next/navigation";
import React from "react";
// import GradientBlinds from "./GradientBlinds";

export interface DebateItem {
  id: number;
  title: string;
  description: string;
  poster: string;
  question: string;
  stake: string;
  url?: string;
  yesPercent?: number;
  noPercent?: number;
  yesPot?: string;
  noPot?: string;
  finalized?: boolean;
  endTime?: number;
}

const DebateGrid: React.FC = () => {
  const { data: contractData, debates, isLoading, error } = useDebateContractData();
  const config = useConfig();
  const router = useRouter();

  // Transform the data to match our interface
  const transformedData: DebateItem[] = debates.map((debate, index) => {
    const contractInfo = contractData[index];
    const totalVotes = contractInfo ? Number(contractInfo.yesCount) + Number(contractInfo.noCount) : 0;
    const yesPercent = totalVotes > 0 && contractInfo ? 
      Math.round((Number(contractInfo.yesCount) / totalVotes) * 100) : 0;
    const noPercent = totalVotes > 0 && contractInfo ? 
      Math.round((Number(contractInfo.noCount) / totalVotes) * 100) : 0;

    // Get chain info dynamically
    const chain = config.chains.find(c => c.id === debate.chainId);
    const nativeCurrency = chain?.nativeCurrency;
    const nativeAsset = nativeCurrency?.symbol || 'ETH';
    const decimals = nativeCurrency?.decimals || 18;
    
    const formatAmount = (amount: bigint) => {
      const divisor = Math.pow(10, decimals);
      const value = Number(amount) / divisor;
      
      // Format to avoid scientific notation and remove trailing zeros
      if (value === 0) return `0 ${nativeAsset}`;
      
      // Use toFixed with high precision to avoid scientific notation, then remove trailing zeros
      const formatted = value.toFixed(decimals);
      const trimmed = formatted.replace(/\.?0+$/, '');
      
      return `${trimmed} ${nativeAsset}`;
    };

    return {
      id: debate.id,
      title: debate.title,
      description: debate.description,
      poster: contractInfo?.creator || '',
      question: debate.title,
      stake: contractInfo ? formatAmount(contractInfo.voteFee) : `0 ${nativeAsset}`,
      url: debate.assetUrl || undefined,
      yesPercent,
      noPercent,
      yesPot: contractInfo ? formatAmount(contractInfo.yesPot) : `0 ${nativeAsset}`,
      noPot: contractInfo ? formatAmount(contractInfo.noPot) : `0 ${nativeAsset}`,
      finalized: contractInfo?.finalized || false,
      endTime: contractInfo ? Number(contractInfo.endTime) : 0,
    };
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading debates: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {transformedData.map((debate) => (
        <div
          key={debate.id}
          onClick={() => router.push(`/${debate.id}`)}
          className="flex flex-col p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-700 shadow-md hover:shadow-lg cursor-pointer transition relative overflow-hidden"
          style={{ minHeight: 180 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {debate.poster ? (
                <AddressName address={debate.poster as `0x${string}`} />
              ) : (
                'Unknown'
              )}
            </h3>
            {debate.finalized && (
              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                Finalized
              </span>
            )}
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-300 font-medium line-clamp-2">{debate.question}</p>
          <div className="mt-3 space-y-1">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Vote Fee: {debate.stake}</span>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Yes Pot: {debate.yesPot}</span>
              <span>No Pot: {debate.noPot}</span>
            </div>
          </div>
          {(debate.yesPercent !== undefined && debate.noPercent !== undefined) && (
            <div className="mt-5 w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{debate.yesPercent}% Yes</span>
                <span className="text-sm font-medium text-cyan-500 dark:text-cyan-400">{debate.noPercent}% No</span>
              </div>
              <div className="relative w-full h-3 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${debate.yesPercent}%` }}
                >
                </div>
                <div
                  className="h-full bg-cyan-500"
                  style={{ width: `${debate.noPercent}%` }}
                >
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
export default DebateGrid;
