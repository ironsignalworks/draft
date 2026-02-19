
  # DocKernel UI Design

  This is a code bundle for DocKernel UI Design. The original project is available at https://www.figma.com/design/BU8E1Y2o2CkEe8dA0dZq6y/DocKernel-UI-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Deploying to GitHub Pages

  This repo is configured for GitHub Pages in two ways:

  1. Automatic deploy on push to `main` via `.github/workflows/deploy-pages.yml`
  2. Manual deploy from your machine via `npm run deploy`

  ### One-time GitHub setup

  1. Push this repo to GitHub.
  2. In GitHub, go to `Settings > Pages`.
  3. Under **Build and deployment**, set **Source** to `GitHub Actions`.

  ### Manual deploy command

  Run:

  `npm run deploy`

  This builds with a relative base path (`npm run build:gh`) and publishes `dist` to the `gh-pages` branch.
  
