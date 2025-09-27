import { useReadContracts } from 'wagmi';
import { useGetAllDebates } from './useGetAllDebates';
import { CONTRACT_ABI } from '@/constants';
import { chainToContractAddress } from '@/constants';
import { SupportedChainId } from '@/config/wagmi';

export interface DebateContractData {
  debateId: number;
  creator: string;
  endTime: bigint;
  voteFee: bigint;
  yesCount: bigint;
  noCount: bigint;
  yesPot: bigint;
  noPot: bigint;
  finalized: boolean;
  result: number;
  residual: bigint;
}

export const useDebateContractData = () => {
  const { data: debates, isLoading: debatesLoading, error: debatesError } = useGetAllDebates();

  // Create contract read configurations for all debates
  const contractReads = debates?.map((debate) => ({
    address: chainToContractAddress[debate.chainId as SupportedChainId],
    abi: CONTRACT_ABI,
    functionName: 'debates',
    args: [BigInt(debate.debateId)],
    chainId: debate.chainId,
  })) || [];

  const {
    data: contractData,
    isLoading: contractLoading,
    error: contractError,
    refetch,
  } = useReadContracts({
    contracts: contractReads,
    query: {
      enabled: !!debates && debates.length > 0,
      staleTime: 30 * 1000, // 30 seconds
    },
  });

  // Transform the contract data to match our interface
  const transformedData: DebateContractData[] = contractData?.map((result, index) => {
    if (result.status === 'success' && debates?.[index]) {
      const data = result.result as any;
      return {
        debateId: debates[index].debateId,
        creator: data[0],
        endTime: data[1],
        voteFee: data[2],
        yesCount: data[3],
        noCount: data[4],
        yesPot: data[5],
        noPot: data[6],
        finalized: data[7],
        result: data[8],
        residual: data[9],
      };
    }
    return null;
  }).filter(Boolean) as DebateContractData[] || [];

  return {
    data: transformedData,
    isLoading: debatesLoading || contractLoading,
    error: debatesError || contractError,
    refetch,
    debates: debates || [],
  };
};
