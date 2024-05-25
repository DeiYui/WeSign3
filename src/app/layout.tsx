"use client";
import Loader from "@/components/UI/Loader";
import "@/css/style.css";
import { persistor, store } from "@/store";
import { injectStore } from "@/utils/api/http";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/css/jsvectormap.css";
import { useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import ClientLoader from "./ClientLoader";
import { SocketProvider } from "@/hooks/useContext";

injectStore(store);

export default function RootLayout({ children }: any) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider>
            <Provider store={store}>
              <PersistGate loading={<Loader />} persistor={persistor}>
                <SocketProvider>
                  <div className="overflow-hidden dark:bg-boxdark-2 dark:text-bodydark">
                    <ClientLoader>{children}</ClientLoader>
                  </div>
                </SocketProvider>
              </PersistGate>
            </Provider>
          </ConfigProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
