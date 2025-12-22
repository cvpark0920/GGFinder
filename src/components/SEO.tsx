import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  siteName?: string;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://finder.ggacademy.top';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export function SEO({
  title = 'GGFinder - 국제 결혼 매칭 플랫폼',
  description = 'GGFinder는 한국과 대만 간의 국제 결혼 매칭을 위한 전문 플랫폼입니다. 신랑과 신부 프로필을 확인하고 매칭을 시작하세요.',
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  siteName = 'GGFinder',
}: SEOProps) {
  const currentUrl = url || window.location.href;
  const fullImageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  return (
    <Helmet>
      {/* 기본 메타 태그 */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph 메타 태그 */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content="ko_KR" />

      {/* Twitter Card 메타 태그 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
    </Helmet>
  );
}

