const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting icon refresh utility');

// Get the app executable path
const appExePath = process.execPath;
console.log(`App executable path: ${appExePath}`);

// Only run on Windows
if (process.platform === 'win32') {
  try {
    const iconPath = path.join(__dirname, 'build', 'icon.ico');
    console.log(`Icon path: ${iconPath}`);
    
    if (fs.existsSync(iconPath)) {
      console.log('Icon file exists, proceeding with update');
      
      // This will force the shell to refresh the icon cache
      const command = `
        $filePath = "${appExePath.replace(/\\/g, '\\\\')}";
        $iconPath = "${iconPath.replace(/\\/g, '\\\\')}";
        
        # Add the necessary type
        Add-Type -TypeDefinition @"
          using System;
          using System.Runtime.InteropServices;
          public class IconRefresher {
            [DllImport("shell32.dll")]
            public static extern int SHChangeNotify(int eventId, int flags, IntPtr item1, IntPtr item2);
          }
"@;

        # Call SHChangeNotify to refresh the icon
        [IconRefresher]::SHChangeNotify(0x8000000, 0x1000, [IntPtr]::Zero, [IntPtr]::Zero);
        
        Write-Host "Icon cache refresh requested.";
      `;
      
      // Execute the PowerShell command
      execSync(`powershell -Command "${command}"`, {
        stdio: 'inherit'
      });
      
      console.log('Icon refresh completed successfully');
    } else {
      console.error('Icon file does not exist');
    }
  } catch (error) {
    console.error('Error refreshing icon:', error);
  }
}
