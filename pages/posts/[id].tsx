import Head from 'next/head';
import { GetStaticProps, GetStaticPaths, GetStaticPathsResult } from 'next';

import Date from '../../components/date';
import Layout from '../../components/layout';
import { getAllPostIds, getPostData, PathObject } from '../../lib/posts';
import utilStyles from '../../styles/utils.module.css';

export const getStaticProps: GetStaticProps = async ({ params }: { params: { id: string } }) => {
  const postData = await getPostData(params.id);
  return {
    props: {
      postData,
    },
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths: Array<string> = getAllPostIds().map((pathObj: PathObject) => (
    pathObj.params.id
  ));
  return {
    paths,
    fallback: false,
  } as GetStaticPathsResult;
}

interface PostData {
  title: string;
  date: string;
  contentHtml: string;
}

interface PostProps {
  postData: PostData;
}

const Post = ({ postData }: PostProps) => {
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  );
}

export default Post;
