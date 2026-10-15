/**
 * Static export for GitHub Pages.
 * BASE_PATH is set by the GitHub Actions workflow (e.g. "/persuado" for
 * https://<user>.github.io/persuado). Leave it unset for local dev.
 *
 * @type {import('next').NextConfig}
 */
const basePath = process.env.BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
