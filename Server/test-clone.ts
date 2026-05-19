import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

async function run() {
    let tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'scan-'));
    console.log("Tmp dir:", tmpDir);
    await execAsync(`git clone https://github.com/expressjs/express ${tmpDir}`);
    
    let code = '';
    
    async function walkDir(dir: string) {
        const files = await fs.readdir(dir, { withFileTypes: true });
        for (const file of files) {
          const fullPath = path.join(dir, file.name);
          const relativePath = path.relative(tmpDir, fullPath).replace(/\\/g, '/');
          
          if (['node_modules', 'dist', 'lib', 'build', '.git', '.github'].includes(file.name)) continue;
          
          if (file.isDirectory()) {
            await walkDir(fullPath);
          } else {
            if (file.name.match(/\.(js|jsx|ts|tsx|py|go|java)$/i)) {
                const content = await fs.readFile(fullPath, 'utf8');
                code += `\n// File: ${relativePath}\n`;
            }
          }
        }
    }
    
    await walkDir(tmpDir);
    console.log("Code length:", code.length);
    await fs.rm(tmpDir, { recursive: true, force: true });
}

run().catch(console.error);
