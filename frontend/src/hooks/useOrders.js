import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';

import {
  getOrderHistory,
  deleteOrder
} from '../api/orders';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: getOrderHistory
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrder,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['orders']
      });
    }
  });
}