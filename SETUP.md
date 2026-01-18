# GitHub Pages Setup Instructions

## Enable GitHub Pages for Deployment

The GitHub Actions deployment workflow is configured and ready, but GitHub Pages must be enabled in the repository settings before deployment can succeed.

### Steps to Enable GitHub Pages:

1. Go to your repository settings: https://github.com/JohannesRabauer/ai-game-3/settings/pages

2. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - This will allow the workflow to deploy to GitHub Pages automatically

3. Save the settings

4. Once enabled, the next push to the `main` branch will trigger the deployment workflow

5. Your game will be available at: https://JohannesRabauer.github.io/ai-game-3/

### Troubleshooting

If the deployment fails with a 404 error, ensure that:
- GitHub Pages is enabled in the repository settings
- The source is set to "GitHub Actions"
- The repository has the correct permissions set in the workflow file (already configured)

### What's Already Configured

✅ GitHub Actions workflow (`.github/workflows/deploy.yml`)
✅ Vite base path set to `/ai-game-3/`
✅ `.nojekyll` file to prevent Jekyll processing
✅ Proper permissions in the workflow
✅ Build and deployment jobs properly configured

Once you enable GitHub Pages in the repository settings, everything should work automatically!
