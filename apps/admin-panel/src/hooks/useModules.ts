import { useQuery } from "@tanstack/react-query";
import { modules as api } from "../lib/api";

export function useModules() {
  return useQuery({
    queryKey: ["modules"],
    queryFn: api.list,
  });
}
