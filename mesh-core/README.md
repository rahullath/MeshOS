# Life Dashboard

A personal dashboard application built with Next.js.

## Setup

1.  Clone the repository.
2.  Install dependencies: `yarn install`
3.  Create a `.env.local` file and add the following environment variables:

    ```
    MONGODB_URI=
    JWT_SECRET=
    NEXT_PUBLIC_API_URL=
    GEMINI_API_KEY=
    CMC_API_KEY=
    ```

## Usage

1.  Run the development server: `yarn dev`
2.  Open [http://localhost:3000](http://localhost:3000) in your browser to view the dashboard.

## Environment Variables

*   `MONGODB_URI`: The URI for your MongoDB database.
*   `JWT_SECRET`: A secret key used for JWT authentication.
*   `NEXT_PUBLIC_API_URL`: The URL of the API backend.
*   `GEMINI_API_KEY`: The API key for the Gemini API.
*   `CMC_API_KEY`: The API key for the CoinMarketCap API.
