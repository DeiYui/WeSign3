// next.config.mjs
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Example to add a custom alias for src directory
    config.resolve.alias["@"] = path.join(__dirname, "src");

    // Modify the way files are resolved
    config.resolve.extensions = [".js", ".jsx", ".ts", ".tsx", ".json"];

    // Ensure URLs with unsupported schemes are handled correctly
    config.module.rules.push({
      test: /\.js$/,
      use: [
        {
          loader: "babel-loader",
          options: {
            presets: ["next/babel"],
          },
        },
      ],
      exclude: /node_modules/,
    });

    // Adding a rule to handle specific files or URLs
    config.module.rules.push({
      test: /\.(txt|md)$/,
      use: "raw-loader",
    });

    // Additional configuration for content scripts
    if (!isServer) {
      config.module.rules.push({
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["next/babel"],
            },
          },
        ],
        include: path.resolve(__dirname, "src/contentScripts"),
      });
    }

    return config;
  },
};

export default nextConfig;
