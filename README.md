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

## Deploying to Netlify

To deploy your application to Netlify, follow these steps:

1.  **Push to a Git Repository**: Make sure your project is pushed to a GitHub, GitLab, or Bitbucket repository.

2.  **Import Project on Netlify**:
    *   Go to your [Netlify Dashboard](https://app.netlify.com/) and click **Add new site** > **Import an existing project**.
    *   Connect your Git provider and select the repository for this project.

3.  **Configure Build Settings & Environment Variables**:
    *   Netlify will automatically detect that you are using Next.js and configure the build settings. You can leave these as default.
    *   Go to the **Environment variables** section.
    *   Add the following variables. You can get these values from your Supabase project settings.
        *   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project anon key.

4.  **Deploy**:
    *   Click the **Deploy site** button.

Your website will be built and deployed. Netlify will provide you with a URL to access your live site.
