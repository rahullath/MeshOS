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
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(10); // Using a fixed limit of 10 per page for now, matches backend default
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        // Construct the API URL with pagination parameters
        const apiUrl = `/api/projects?page=${currentPage}&limit=${projectsPerPage}`;
        console.log("Fetching projects from:", apiUrl);

        const response = await fetch(apiUrl, {
           credentials: "include", // Include cookies for authentication
        });
        
        if (!response.ok) {
           const errorData = await response.json();
           throw new Error(`Error fetching projects: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log("Fetched projects data:", data);
        
        // Assuming the API returns an object with 'projects' array and 'pagination' info
        setProjects(data.projects || []);
        setTotalPages(data.pagination?.pages || 0); // Store total pages for potential pagination controls

      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(`Failed to load projects: ${err.message}`);
        setProjects([]); // Clear projects on error
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
    // Re-fetch projects when the current page changes
  }, [currentPage, projectsPerPage]); // Dependency array includes pagination state

  const handlePageChange = (page) => {
     setCurrentPage(page);
     // Note: This currently doesn't have pagination controls implemented in the UI
     // You would need to add buttons/links to call this function.
  };

  // Add a function to handle adding new projects
  const handleAddProject = () => {
    // Implement navigation to a new project creation page if you have one
    console.log('Navigate to new project creation page');
    // Example: router.push('/projects/new'); // Assuming you have a route for this
  };

  return (
    <Layout>
      <Head>
        <title>Projects | Mesh OS</title>
      </Head>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
           {/* Example Add Project Button */}
           {/* <button
             onClick={handleAddProject}
             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
           >
             Add Project
           </button> */}
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

        {/* Basic Pagination Info (You would need UI controls to change currentPage) */}
        {!loading && totalPages > 1 && (
          <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
        )}

        {/* Keep other components if they are for separate functionalities */}
        {/* <ProjectTracker /> */}
        {/* <CodingProgress /> */}

      </div>
    </Layout>
  );
}
