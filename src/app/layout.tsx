"use client";
import Loader from "@/components/common/Loader";
import { injectStore } from "@/utils/api/http";
import "@/css/satoshi.css";
import "@/css/style.css";
import { store } from "@/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/css/jsvectormap.css";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { usePathname, useRouter } from "next/navigation";

const persistor = persistStore(store);
injectStore(store);

export default function RootLayout({ children }: any) {
  const router: any = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState<boolean>(true);
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && (pathname === "/login" || pathname === "/register")) {
      router.push("/");
    }
  }, [pathname, router]);

  return (
    <html lang="en">
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
