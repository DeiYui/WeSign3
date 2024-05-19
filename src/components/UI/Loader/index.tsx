import { colors } from "@/assets/colors";
import { Logo } from "@/assets/icons";

const Loader = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white dark:bg-black">
      <div className="flex items-end">
        <Logo size={80} color={colors.primary400} />
        <div className="mb-1 text-3xl font-bold text-blue-600">eSign</div>
      </div>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
};

export default Loader;
