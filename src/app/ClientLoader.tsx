// components/ClientLoader.tsx
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Loader from "@/components/UI/Loader";

const ClientLoader = ({ children }: any) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token && pathname?.includes("/profile")) {
      router.push("/");
    }
    if (
      token &&
      (pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/verify-otp")
    ) {
      router.push("/");
    }
  }, [pathname, router]);

  if (loading) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default ClientLoader;
