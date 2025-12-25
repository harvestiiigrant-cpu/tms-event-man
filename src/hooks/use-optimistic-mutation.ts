import { useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface OptimisticMutationOptions<TData, TVariables> {
  queryKey: QueryKey;
  mutationFn: (variables: TVariables) => Promise<TData>;
  // How to update the cache optimistically
  updateCache: (oldData: TData[] | undefined, variables: TVariables) => TData[];
  // Success message
  successMessage?: string;
  // Error message
  errorMessage?: string;
  // Called on success
  onSuccess?: (data: TData, variables: TVariables) => void;
}

export function useOptimisticMutation<TData, TVariables>({
  queryKey,
  mutationFn,
  updateCache,
  successMessage = 'បានរក្សាទុកដោយជោគជ័យ',
  errorMessage = 'មានបញ្ហាក្នុងការរក្សាទុក',
  onSuccess,
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    // Optimistic update
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TData[]>(queryKey);

      // Optimistically update cache
      queryClient.setQueryData<TData[]>(queryKey, (old) => updateCache(old, variables));

      // Return context with snapshot
      return { previousData };
    },
    // On error, rollback
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast({
        title: 'បរាជ័យ',
        description: errorMessage,
        variant: 'destructive',
      });
    },
    // On success
    onSuccess: (data, variables) => {
      toast({
        title: 'ជោគជ័យ',
        description: successMessage,
      });
      onSuccess?.(data, variables);
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// Hook for optimistic delete
export function useOptimisticDelete<TData extends { id: string }>({
  queryKey,
  mutationFn,
  successMessage = 'បានលុបដោយជោគជ័យ',
  errorMessage = 'មានបញ្ហាក្នុងការលុប',
}: {
  queryKey: QueryKey;
  mutationFn: (id: string) => Promise<TData>;
  successMessage?: string;
  errorMessage?: string;
}) {
  return useOptimisticMutation<TData, string>({
    queryKey,
    mutationFn,
    updateCache: (oldData, id) => oldData?.filter((item) => item.id !== id) || [],
    successMessage,
    errorMessage,
  });
}

// Hook for optimistic update
export function useOptimisticUpdate<TData extends { id: string }>({
  queryKey,
  mutationFn,
  successMessage = 'បានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ',
  errorMessage = 'មានបញ្ហាក្នុងការធ្វើបច្ចុប្បន្នភាព',
}: {
  queryKey: QueryKey;
  mutationFn: (data: { id: string; data: Partial<TData> }) => Promise<TData>;
  successMessage?: string;
  errorMessage?: string;
}) {
  return useOptimisticMutation<TData, { id: string; data: Partial<TData> }>({
    queryKey,
    mutationFn,
    updateCache: (oldData, { id, data }) =>
      oldData?.map((item) => (item.id === id ? { ...item, ...data } : item)) || [],
    successMessage,
    errorMessage,
  });
}

// Hook for optimistic create
export function useOptimisticCreate<TData extends { id: string }>({
  queryKey,
  mutationFn,
  successMessage = 'បានបង្កើតដោយជោគជ័យ',
  errorMessage = 'មានបញ្ហាក្នុងការបង្កើត',
}: {
  queryKey: QueryKey;
  mutationFn: (data: Omit<TData, 'id'>) => Promise<TData>;
  successMessage?: string;
  errorMessage?: string;
}) {
  return useOptimisticMutation<TData, Omit<TData, 'id'>>({
    queryKey,
    mutationFn,
    updateCache: (oldData, newData) => [
      { ...newData, id: `temp-${Date.now()}` } as TData,
      ...(oldData || []),
    ],
    successMessage,
    errorMessage,
  });
}

// Hook for bulk delete
export function useOptimisticBulkDelete<TData extends { id: string }>({
  queryKey,
  mutationFn,
  successMessage = 'បានលុបធាតុដែលបានជ្រើសរើសដោយជោគជ័យ',
  errorMessage = 'មានបញ្ហាក្នុងការលុបធាតុ',
}: {
  queryKey: QueryKey;
  mutationFn: (ids: string[]) => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
}) {
  return useOptimisticMutation<void, string[]>({
    queryKey,
    mutationFn,
    updateCache: (oldData, ids) => oldData?.filter((item) => !ids.includes(item.id)) || [],
    successMessage,
    errorMessage,
  });
}
