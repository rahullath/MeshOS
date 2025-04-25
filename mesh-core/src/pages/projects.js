import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import ProjectTracker from '../components/projects/ProjectTracker';
import CodingProgress from '../components/projects/CodingProgress';
import ProjectList from '../components/projects/ProjectList'; // Import the new ProjectList component

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching projects from /api/projects");
        const response = await fetch('/api/projects', {
           credentials: "include", // Include cookies for authentication
        });
        
        if (!response.ok) {
           const errorData = await response.json();
           throw new Error(`Error fetching projects: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log("Fetched projects data:", data);
        // Assuming the API returns an array of projects directly
        setProjects(data);

      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(`Failed to load projects: ${err.message}`);
        setProjects([]); // Clear projects on error
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []); // Empty dependency array means this effect runs only once on mount

  return (
    <Layout>
      <Head>
        <title>Projects | Mesh OS</title>
      </Head>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
           {/* Add a button to add new projects if needed */}
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Track your ongoing projects and coding progress.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Loading projects...</span>
          </div>
        ) : (
           // Render the ProjectList component with fetched data
           <ProjectList projects={projects} />
        )}

        {/* Keep other components if they are for separate functionalities */}
        {/* <ProjectTracker /> */}
        {/* <CodingProgress /> */}

      </div>
    </Layout>
  );
}
