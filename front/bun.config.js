await Bun.build({
    entrypoints: ['./src/main.ts'], // Adjust this path as needed
    outdir: './dist', // Output directory for bundled files
    sourcemap: 'inline', // Optional: include source maps
});
