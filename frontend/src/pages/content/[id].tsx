import React from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps, NextPage } from 'next';
import ContentDetail from '@/presentation/components/organisms/ContentDetail';
import Head from 'next/head';

interface ContentDetailPageProps {
  contentId: number;
}

const ContentDetailPage: NextPage<ContentDetailPageProps> = ({ contentId }) => {
  const router = useRouter();
  
  // SSR이 아닌 CSR로 동작할 때 (예: 클라이언트 측 네비게이션)
  if (router.isFallback) {
    return <div>로딩 중...</div>;
  }

  return (
    <>
      <Head>
        <title>콘텐츠 상세 | MiniFlix</title>
        <meta name="description" content="콘텐츠 상세 정보를 확인하세요" />
      </Head>
      <main className="flex min-h-screen flex-col bg-black text-white">
        <ContentDetail contentId={contentId} />
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<ContentDetailPageProps> = async (context) => {
  const { id } = context.params || {};
  
  if (!id || Array.isArray(id)) {
    return {
      notFound: true
    };
  }

  const contentId = parseInt(id, 10);
  
  if (isNaN(contentId)) {
    return {
      notFound: true
    };
  }
  
  return {
    props: {
      contentId
    }
  };
};

export default ContentDetailPage; 