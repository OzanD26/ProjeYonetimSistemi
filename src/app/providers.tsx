import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App as AntdApp } from "antd";
<<<<<<< HEAD
import { queryClient } from "../app/queryClient";
=======
import { queryClient } from "./queryClient";
>>>>>>> 9447b77 (Mock api ayarları login girişi ayarlandı)

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={{ token: { borderRadius: 10 } }}>
      <QueryClientProvider client={queryClient}>
        <AntdApp>{children}</AntdApp>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
