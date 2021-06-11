This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Environments and Policies

The config files are split between `.env` and `policy.ts`

### .env

```ini
TITLE=  # The title of the webpage to be displayed in the meta and the screen
MONGO_SRV= # Link for the mongo database
DOMAIN= # The domain attatched to the page
```

### policy.ts

```typescript
import { IPolicy } from "./IPolicy";

export const Policy: IPolicy = {
  approve_posts: true, // Posts require manual approval before joining the blockchain
  publickey: {
    preapproved: true, // If there is a public key, it has to have already been approved
    require: true, // Public keys are required
  },
  embeds: ["image/webp", "video/webm"], // The mimetype of the embedded files allowed
  maxEmbeds: 3, // Maximum number of embedded files
  maxSize: 1e7, // Maximum size of the embedded files in bytes (currently 10MB)
  maxLength: 10000 // Maximum length of the body of a thread in characters
  rules: [ // Rules that will be displayed on the index page
    "Rule 1",
    "Rule 2",
    "Rule 3",
  ],
  categories: [ // Allowed categories, equivilant to 4chan's boards
    {
      name: "all",
      title: "All",
      description: "Welcomes all posts",
    },
  },
  hash_algo: "SHA-256", // Default hashing algorithm
};


```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
