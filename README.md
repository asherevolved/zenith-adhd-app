# Zenith - ADHD Productivity and Wellness Platform

This is a Next.js application built with Firebase Studio. It's a web-based platform designed to help with productivity and wellness, especially for individuals with ADHD.

## Getting Started

To get started with local development, first install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Deploying to Vercel

To deploy your application to Vercel, follow these steps:

1.  **Push to a Git Repository**: Make sure your project is pushed to a GitHub, GitLab, or Bitbucket repository.

2.  **Import Project on Vercel**:
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** > **Project**.
    *   Import the Git repository containing your project.

3.  **Configure Environment Variables**:
    *   During the import process, Vercel will ask you to configure your project.
    *   Go to the **Environment Variables** section.
    *   Add the following variables from your `.env` file:
        *   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project anon key.

4.  **Deploy**:
    *   Vercel will automatically detect that you are using Next.js and configure the build settings.
    *   Click the **Deploy** button.

Your website will be built and deployed. Vercel will provide you with a URL to access your live site.
