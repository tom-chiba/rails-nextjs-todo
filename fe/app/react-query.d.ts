import "@tanstack/react-query";

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: { skipRedirectOn401?: boolean };
    mutationMeta: { skipRedirectOn401?: boolean };
  }
}
