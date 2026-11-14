import { defineConfig } from 'vite';
import JavaScriptObfuscator from 'javascript-obfuscator';

// Protège le code de l'app : le JavaScript livré est brouillé (noms et textes illisibles),
// sans fichiers de debug (sourcemaps). Désactivable : OBFUSCATE=0 npm run build
const protect = () => ({
  name: 'digiform-protect',
  apply: 'build',
  enforce: 'post',
  renderChunk(code, chunk) {
    if (process.env.OBFUSCATE === '0' || !chunk.isEntry) return null;
    const out = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      identifierNamesGenerator: 'hexadecimal',
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 0.7,
      stringArrayWrappersCount: 1,
      rotateStringArray: true,
      shuffleStringArray: true,
      splitStrings: false,
      controlFlowFlattening: false,
      deadCodeInjection: false,
      selfDefending: false,
      debugProtection: false,
      renameGlobals: false,
      transformObjectKeys: false,
      unicodeEscapeSequence: false,
      target: 'browser',
    });
    return { code: out.getObfuscatedCode(), map: null };
  },
});

export default defineConfig({
  base: './',
  esbuild: { drop: ['debugger'] },
  build: { sourcemap: false },
  plugins: [protect()],
});
