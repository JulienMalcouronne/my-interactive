import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
