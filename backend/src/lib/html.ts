/**
 * Helper functions for working with HTML.
 *
 * For a single-page web app that uses client-side components to dynamically
 * modify the DOM, there is little need for a sophisticated server-side
 * templating engine. The server typically only needs to generate HTML for the
 * app's simple initial skeleton landing page.
 *
 * Similar to working with SQL, JavaScript template literals are good enough for
 * this task.
 */

/**
 * Return string of a complete HTML page.
 */
export function getPage(body: string): string {
  return trim(`
    <!doctype html> 
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Sticky</title>
        <link href="style.css" rel="stylesheet" />
      </head>
      <body>
        ${indent(body, 4)}
      </body>
    </html>  
  `);
}

/**
 * Trim superfluous newline and space characters from a multiline HTML string
 * expressed using JavaScript template literals.
 *
 * return `
 *   <html>
 *     <head></head>
 *     <body></body>
 *   </html>
 * `;
 * ->
 * <html>
 *   <head></head>
 *   <body></body>
 * </html>
 */
export function trim(s: string): string {
  const lines = s.split("\n").slice(1, -1);
  const indent = lines[0].indexOf("<");
  return lines.map((line) => line.slice(indent)).join("\n");
}

/**
 * Indent an HTML fragment string appropriately within its containing HTML
 * string. Often used with the `trim` function.
 *
 * The indent parameter `n` is the number of tab indentations that should be
 * applied to the HTML fragment relative to the source code line where it's
 * referenced. A tab character is considered equivalent to 2 space characters.
 *
 * return `
 *   <html>
 *     <head></head>
 *     <body>
 *       ${indent(body, 3)}
 *     </body>
 *   </html>
 * `;
 * ->
 * <html>
 *   <head></head>
 *   <body>
 *     <div>Hello</div>
 *     <div>World</div>
 *   </body>
 * </html>
 */
function indent(s: string, n: number): string {
  return s
    .split("\n")
    .map((line, i) => (i === 0 ? line : " ".repeat(n * 2) + line))
    .join("\n");
}
