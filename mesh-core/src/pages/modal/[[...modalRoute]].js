// mesh-core/src/pages/modal/[[...modalRoute]].js
import React from 'react';
import { useRouter } from 'next/router';

const ModalContentPage = () => {
  const router = useRouter();
  const { modalRoute } = router.query; // This will be an array like ['pricing'] or ['item', '123']

  const contentPath = modalRoute ? modalRoute.join('/') : 'index'; // e.g., 'pricing'

  // Basic example: show different content based on the first part of the path
  let contentToDisplay = <p>Default modal content for path: /{contentPath}</p>;

  if (contentPath === 'pricing') {
    contentToDisplay = (
      <div>
        <h3>Pricing Information</h3>
        <p>Details about our pricing plans go here.</p>
        <p>This content is rendered from the /modal/pricing route.</p>
      </div>
    );
  } else if (contentPath.startsWith('item/')) {
      const itemId = modalRoute[1]; // Get the ID part
       contentToDisplay = (
      <div>
        <h3>Details for Item ID: {itemId}</h3>
        <p>Specific information about item {itemId}.</p>
         <p>This content is rendered from the /modal/item/{itemId} route.</p>
      </div>
    );
  }


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Modal Content Page</h1>
      {contentToDisplay}
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        This content is loaded via a dedicated URL route.
      </p>
    </div>
  );
};

// This page is NOT intended to be rendered directly as a full page.
// It's designed to be consumed by the Modal component in _app.js.
// We don't need a Layout here as it will be rendered inside the Modal.

export default ModalContentPage;
