export type GlobPresetMap = typeof globPresetMap;

export type GlobPresetName = keyof GlobPresetMap;

export type GlobOption = GlobPresetName | (string & Record<never, never>);

export const globPresetMap = {
  glob_src_ext: "*.{js,jsx,ts,tsx,cjs,mjs,cts,mts}", // Matches files with these extensions in the current directory
  glob_src: "**/*.{js,jsx,ts,tsx,cjs,mjs,cts,mts}", // Matches files with these extensions in all subdirectories
  glob_js: "**/*.{js,cjs,mjs}", // Matches JavaScript files (.js, .cjs for CommonJS, .mjs for ES Modules) in all subdirectories
  glob_jsx: "**/*.jsx", // Matches JSX files (.jsx) in all subdirectories
  glob_ts: "**/*.{ts,cts,mts}", // Matches TypeScript files (.ts, .cts for CommonJS, .mts for ES Modules) in all subdirectories
  glob_tsx: "**/*.tsx", // Matches TSX files (.tsx) in all subdirectories
  glob_style: "**/*.{css,less,scss}", // Matches CSS, LESS, and SCSS files in all subdirectories
  glob_css: "**/*.css", // Matches CSS files in all subdirectories
  glob_postcss: "**/*.{pcss,postcss}", // Matches PostCSS files in all subdirectories
  glob_less: "**/*.less", // Matches LESS files in all subdirectories
  glob_scss: "**/*.scss", // Matches SCSS files in all subdirectories
  glob_json: "**/*.json", // Matches JSON files in all subdirectories
  glob_json5: "**/*.json5", // Matches JSON5 files in all subdirectories
  glob_jsonc: "**/*.jsonc", // Matches JSONC (JSON with comments) files in all subdirectories
  glob_markdown: "**/*.md", // Matches Markdown files in all subdirectories
  glob_markdown_in_markdown: "**/*.md/*.md", // Matches Markdown files within folders with .md extension (uncommon usage)
  glob_vue: "**/*.vue", // Matches Vue files in all subdirectories
  glob_yaml: "**/*.{yaml,yml}", // Matches YAML files in all subdirectories
  glob_html: "**/*.{html,htm}", // Matches HTML files in all subdirectories
  glob_markdown_code: "**/*.md/**/*.{js,jsx,ts,tsx,cjs,mjs,cts,mts}", // Matches JS/TS files in directories within Markdown files (uncommon usage)
};

export function getGlobOption(glob?: GlobOption) {
  if (!glob) return "";
  if (glob in globPresetMap) return globPresetMap[glob as GlobPresetName];
  return glob;
}
