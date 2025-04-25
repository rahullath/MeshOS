import React from 'react';

export default function ProjectList({ projects = [] }) {
  if (projects.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center mt-6">
        <p className="text-gray-500 dark:text-gray-400">No projects found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mt-6">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {projects.map((project) => (
          <li key={project._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{project.name}</h3>
            {project.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
            )}
            {/* Add more project details here as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
}
