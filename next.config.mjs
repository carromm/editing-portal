/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
	domains: ['ai-input.s3.amazonaws.com', 'ai-output.s3.amazonaws.com'],
  },
};

export default nextConfig;
