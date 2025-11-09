// Simple markdown parser for basic formatting
export function parseMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Code inline
    .replace(/`(.*?)`/g, '<code class="bg-slate-200 dark:bg-slate-700 px-1 rounded text-sm">$1</code>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto"><code>$1</code></pre>')
    // Tables
    .replace(/(\|[^\n]+\|)\n(\|[-:| ]+\|)\n((\|[^\n]+\|(?:\n|$))+)/g, (match, header, separator, body) => {
      const headerCells = header.trim().split('|').slice(1, -1).map(cell => `<th class="border border-slate-300 dark:border-slate-600 px-3 py-2 bg-slate-50 dark:bg-slate-700 font-semibold">${cell.trim()}</th>`).join('');
      const bodyRows = body.trim().split('\n').filter(row => row.trim()).map(row => {
        const cells = row.split('|').slice(1, -1).map(cell => `<td class="border border-slate-300 dark:border-slate-600 px-3 py-2">${cell.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table class="border-collapse border border-slate-300 dark:border-slate-600 my-4 w-full"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    })
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br>');
}