import Layout from '../components/layout/Layout';
import Head from 'next/head';
import ProjectTracker from '../components/projects/ProjectTracker';
import CodingProgress from '../components/projects/CodingProgress';

export default function ProjectsPage() {
  return (
    <Layout>
      <Head>
        <title>Projects | Mesh OS</title>
      </Head>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <ProjectTracker />
        <CodingProgress />
      </div>
    </Layout>
  );
}
