const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const gitDir = path.join(repoRoot, '.git');
const indexFile = path.join(gitDir, 'index');
const bakFile = path.join(gitDir, 'index.bak');

if (!fs.existsSync(gitDir)) {
  process.exit(0);
}

let isHealing = false;

function healOrBackup() {
  if (isHealing) return;
  try {
    if (!fs.existsSync(indexFile)) {
      if (fs.existsSync(bakFile)) {
        isHealing = true;
        fs.copyFileSync(bakFile, indexFile);
        isHealing = false;
        console.log('🛡️ Git Guard: Restored missing .git/index from backup.');
      }
      return;
    }

    const stat = fs.statSync(indexFile);
    if (stat.size < 64) {
      if (fs.existsSync(bakFile) && fs.statSync(bakFile).size >= 64) {
        isHealing = true;
        fs.copyFileSync(bakFile, indexFile);
        isHealing = false;
        console.log(`🛡️ Git Guard: Detected truncated .git/index (${stat.size} bytes). Auto-healed immediately!`);
      }
    } else {
      // Keep backup updated with latest valid index
      fs.copyFileSync(indexFile, bakFile);
    }
  } catch (err) {
    isHealing = false;
  }
}

// Initial health check
healOrBackup();

// Watch .git folder for changes
try {
  fs.watch(gitDir, (eventType, filename) => {
    if (!filename || filename === 'index' || filename === 'index.lock') {
      healOrBackup();
    }
  });
} catch (e) {
  // Polling fallback
  setInterval(healOrBackup, 500);
}

// Low frequency periodic check as safety net
setInterval(healOrBackup, 1000);

console.log('🛡️ Git Guard active: watching .git/index for corruption.');
