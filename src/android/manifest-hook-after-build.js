const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    const manifestPath = path.join(context.opts.projectRoot, 'platforms/android/app/src/main/AndroidManifest.xml');
    if (fs.existsSync(manifestPath)) {
        let manifest = fs.readFileSync(manifestPath, 'utf8');

        // Remove specific provider for cdv.core.file.provider, along with leading/trailing whitespace
        manifest = manifest.replace(
            /\n\s*<provider\s+android:authorities="\${applicationId}\.cdv\.core\.file\.provider"[^>]*>[\s\S]*?<\/provider>\s*\n/,
            '\n'
        );

        // Ensure proper indentation is maintained
        manifest = manifest.replace(/\n{2,}/g, '\n');

        fs.writeFileSync(manifestPath, manifest, 'utf8');
        console.log("✅ >>> Success to remove the duplicate provider from the manifest file: " + manifestPath);
    } else {
        console.log("❌ >>> Error to find the manifest file: " + manifestPath);
    }
};