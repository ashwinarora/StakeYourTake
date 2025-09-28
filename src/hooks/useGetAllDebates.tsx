import { useQuery } from '@tanstack/react-query';

export interface Debate {
  id: number;
  title: string;
  description: string;
  debateId: number;
  assetUrl: string | null;
  chainId: number;
  creationTxHash: string;
  createdAt: string;
  updatedAt: string;
//   Evidence: any[]; // You can type this more specifically if needed
}

const fetchAllDebates = async (): Promise<Debate[]> => {
  const response = await fetch('/api/debate');
  
  if (!response.ok) {
    throw new Error('Failed to fetch debates');
  }
  
  return response.json();
};

export const useGetAllDebates = () => {
  return useQuery({
    queryKey: ['debates'],
    queryFn: fetchAllDebates,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
