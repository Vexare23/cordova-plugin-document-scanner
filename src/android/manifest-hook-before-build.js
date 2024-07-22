const fs = require('fs');
const path = require('path');

module.exports = function(context) {
    const manifestPath = path.join(context.opts.projectRoot, 'platforms/android/app/src/main/AndroidManifest.xml');
    if (fs.existsSync(manifestPath)) {
        let manifest = fs.readFileSync(manifestPath, 'utf8');

        // Ensure tools namespace is present
        if (!manifest.includes('xmlns:tools="http://schemas.android.com/tools"')) {
            manifest = manifest.replace('<manifest', '<manifest xmlns:tools="http://schemas.android.com/tools"');
        }

        // Add ScanActivity and scanlibrary provider if not present
        if (!manifest.includes('android:name=".ScanActivity"')) {
            const applicationTagEndIndex = manifest.lastIndexOf('</application>');
            const newElements = `
            <activity android:configChanges="orientation|screenSize" android:label="@string/app_name" android:name=".ScanActivity"/>
            <provider android:authorities="\${applicationId}.com.scanlibrary.provider" android:exported="false" android:grantUriPermissions="true" android:name="androidx.core.content.FileProvider" tools:replace="android:authorities">
              <meta-data android:name="android.support.FILE_PROVIDER_PATHS" android:resource="@xml/provider_paths" tools:replace="android:resource"/>
            </provider>`;

            manifest = manifest.slice(0, applicationTagEndIndex) + newElements + manifest.slice(applicationTagEndIndex);
        }

        // Add tools:replace to the provider element if not already present
        manifest = manifest.replace(
            /(<provider\s+[^>]*androidx.core.content.FileProvider[^>]*)(>)/,
            (match, p1, p2) => {
                if (!match.includes('tools:replace="android:authorities"')) {
                    return `${p1.trim()} tools:replace="android:authorities"${p2}`;
                }
                return match;
            }
        );

        // Add tools:replace to the meta-data element if not already present
        manifest = manifest.replace(
            /(<meta-data\s+[^>]*android.support.FILE_PROVIDER_PATHS[^>]*)(\/>)/,
            (match, p1, p2) => {
                if (!match.includes('tools:replace="android:resource"')) {
                    return `${p1.trim()} tools:replace="android:resource"${p2}`;
                }
                return match;
            }
        );

        fs.writeFileSync(manifestPath, manifest, 'utf8');
        console.log("✅ >>> Success to find and update the manifest file: " + manifestPath);
    } else {
        console.log("❌ >>> Error to find the manifest file: " + manifestPath);
    }
};