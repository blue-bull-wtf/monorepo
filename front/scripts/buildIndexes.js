import fs from 'fs/promises';
import path from 'path';
import { Index } from 'flexsearch';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const docOutputPath = path.join(__dirname, '../src/docIndex.json');
const searchIndexOutputPath = path.join(__dirname, '../src/flexsearchIndex.json');
let records = 0;

// Initialize FlexSearch index
const searchIndex = new Index({
  tokenize: "forward",
  doc: {
    id: "key",
    field: ["content"],
  }
});

async function buildIndex(dir = path.join(__dirname, '../public/mds'), basePath = '') {
  let index = {};

  const filesAndDirs = await fs.readdir(dir);

  for (const name of filesAndDirs) {
    const fullPath = path.join(dir, name);
    const relativePath = path.join(basePath, name).replace(/\\/g, '/');
    const stats = await fs.stat(fullPath);

    if (stats.isDirectory()) {
      Object.assign(index, await buildIndex(fullPath, relativePath));
    } else if (stats.isFile() && path.extname(name) === '.md') {
      const key = `/${relativePath.replace(/\.md$/, '')}`;
      const content = await fs.readFile(fullPath, 'utf8');

      // Add document content to FlexSearch index
      searchIndex.add({
        key: key,
        content: content,
      });

      index[key] = { title: 'Md', props: { file: `mds/${relativePath}` } };
      records++;
    }
  }

  return index;
}

(async () => {
  const index = await buildIndex();
  await fs.writeFile(docOutputPath, JSON.stringify(index, null, 2), 'utf8');
  console.log(`Written docs index (${records} records) to ${docOutputPath}`);

  // Serialize and save the FlexSearch index
  const exportedIndex = searchIndex.export();
  await fs.writeFile(searchIndexOutputPath, JSON.stringify(exportedIndex), 'utf8');
  console.log(`FlexSearch index saved to ${searchIndexOutputPath}`);
})();
