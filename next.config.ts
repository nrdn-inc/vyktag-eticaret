import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // iyzipay, kaynaklarını fs.readdirSync + dinamik require ile çalışma anında yükler;
  // bu Next.js'in sunucu bundle'ına dahil edilemez, native Node.js require'a bırakılmalı.
  serverExternalPackages: ["iyzipay"],
};

export default nextConfig;
