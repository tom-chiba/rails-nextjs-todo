import type { MutationFunction } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { getApiV1TodosResponseSuccess } from "../generated/api-client/todoAPIV1";
import { getGetApiV1TodosQueryKey } from "../generated/api-client/todoAPIV1";
import { selectData } from "../lib/api-client";
import type { Todo } from "../types";

export function useTodosMutation<TVariables, TData>({
  mutationFn,
  updater,
  onSuccess,
}: {
  mutationFn: MutationFunction<TData, TVariables>;
  updater: (variables: TVariables, todos: Todo[]) => Todo[];
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
}) {
  const queryClient = useQueryClient();
  const todosQueryKey = getGetApiV1TodosQueryKey();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: todosQueryKey });
      const previous =
        queryClient.getQueryData<getApiV1TodosResponseSuccess>(todosQueryKey);
      queryClient.setQueryData<getApiV1TodosResponseSuccess>(
        todosQueryKey,
        (old) => {
          if (!old) return old;
          return { ...old, data: updater(variables, selectData(old)) };
        },
      );
      return { previous };
    },
    onSuccess: async (data, variables) => {
      if (onSuccess) await onSuccess(data, variables);
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(todosQueryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKey });
    },
  });
}
