
import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App as AntdApp } from "antd";
import { queryClient } from "./queryClient";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={{ token: { borderRadius: 10 } }}>
      <QueryClientProvider client={queryClient}>
        <AntdApp>{children}</AntdApp>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
