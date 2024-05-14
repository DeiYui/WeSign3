"use client";
import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import { ConfigProvider } from "antd";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { injectStore } from "@/config/http";
import { store } from "@/store";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Head from "next/head";

const persistor = persistStore(store);
injectStore(store);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en">
      <Head>
        {/* Thêm favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body suppressHydrationWarning={true}>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider>
            <Provider store={store}>
              <PersistGate loading={<Loader />} persistor={persistor}>
                <div className="dark:bg-boxdark-2 dark:text-bodydark">
                  {loading ? <Loader /> : children}
                </div>
              </PersistGate>
            </Provider>
          </ConfigProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
