/**
 * Static curated resource map — zero API calls, always available.
 * Covers the 30 most common interview topics.
 *
 * Used as a fallback when YouTube quota is exhausted or YOUTUBE_API_KEY is not set.
 * Also supplements every roadmap item with docs + practice links regardless of YouTube.
 */

export interface StaticResource {
  type: 'video' | 'docs' | 'practice'
  title: string
  url: string
  thumbnail?: string
  channel?: string
  duration?: string
}

export const STATIC_RESOURCES: Record<string, StaticResource[]> = {
  // ── Data Structures ──────────────────────────────────────────────────────────
  arrays: [
    {
      type: 'video',
      title: 'Arrays Crash Course — NeetCode',
      url: 'https://www.youtube.com/watch?v=QJNwK2uJyGs',
      channel: 'NeetCode',
      duration: '16:00',
    },
    {
      type: 'practice',
      title: 'LeetCode — Array Problems',
      url: 'https://leetcode.com/tag/array/',
    },
    {
      type: 'docs',
      title: 'roadmap.sh — DSA',
      url: 'https://roadmap.sh/datastructures-and-algorithms',
    },
  ],

  'linked lists': [
    {
      type: 'video',
      title: 'Linked Lists for Beginners — CS Dojo',
      url: 'https://www.youtube.com/watch?v=WwfhLC16bis',
      channel: 'CS Dojo',
      duration: '9:33',
    },
    {
      type: 'practice',
      title: 'LeetCode — Linked List',
      url: 'https://leetcode.com/tag/linked-list/',
    },
    {
      type: 'docs',
      title: 'Visualgo — Linked List Visualizer',
      url: 'https://visualgo.net/en/list',
    },
  ],

  trees: [
    {
      type: 'video',
      title: 'Binary Trees & BST — Abdul Bari',
      url: 'https://www.youtube.com/watch?v=H5JubkIy_p8',
      channel: 'Abdul Bari',
      duration: '14:56',
    },
    {
      type: 'practice',
      title: 'LeetCode — Tree Problems',
      url: 'https://leetcode.com/tag/tree/',
    },
    {
      type: 'docs',
      title: 'Visualgo — BST Visualizer',
      url: 'https://visualgo.net/en/bst',
    },
  ],

  graphs: [
    {
      type: 'video',
      title: 'Graph Algorithms — William Fiset',
      url: 'https://www.youtube.com/playlist?list=PLDV1Zeh2NRsDGO4--qE8yH72HFL1Km93P',
      channel: 'WilliamFiset',
    },
    {
      type: 'practice',
      title: 'LeetCode — Graph Problems',
      url: 'https://leetcode.com/tag/graph/',
    },
    {
      type: 'docs',
      title: 'roadmap.sh — DSA',
      url: 'https://roadmap.sh/datastructures-and-algorithms',
    },
  ],

  'hash maps': [
    {
      type: 'video',
      title: 'Hash Tables Explained — NeetCode',
      url: 'https://www.youtube.com/watch?v=jalSiaIi8j4',
      channel: 'NeetCode',
      duration: '21:51',
    },
    {
      type: 'practice',
      title: 'LeetCode — Hash Table Problems',
      url: 'https://leetcode.com/tag/hash-table/',
    },
  ],

  stacks: [
    {
      type: 'video',
      title: 'Stack Data Structure — MyCodeSchool',
      url: 'https://www.youtube.com/watch?v=F1F2imiOJfk',
      channel: 'mycodeschool',
    },
    {
      type: 'practice',
      title: 'LeetCode — Stack Problems',
      url: 'https://leetcode.com/tag/stack/',
    },
  ],

  queues: [
    {
      type: 'video',
      title: 'Queue Data Structure — MyCodeSchool',
      url: 'https://www.youtube.com/watch?v=XuCbpw6Bj1U',
      channel: 'mycodeschool',
    },
    {
      type: 'practice',
      title: 'LeetCode — Queue Problems',
      url: 'https://leetcode.com/tag/queue/',
    },
  ],

  heaps: [
    {
      type: 'video',
      title: 'Heap Data Structure — NeetCode',
      url: 'https://www.youtube.com/watch?v=t0Cq6tVNRBA',
      channel: 'NeetCode',
      duration: '12:24',
    },
    {
      type: 'practice',
      title: 'LeetCode — Heap Problems',
      url: 'https://leetcode.com/tag/heap-priority-queue/',
    },
  ],

  // ── Algorithms ───────────────────────────────────────────────────────────────
  'dynamic programming': [
    {
      type: 'video',
      title: 'Dynamic Programming — Aditya Verma (Playlist)',
      url: 'https://www.youtube.com/playlist?list=PL_z_8CaSLPWekqhdCPmFohncHwz8TY2Go',
      channel: 'Aditya Verma',
    },
    {
      type: 'practice',
      title: 'LeetCode — DP Problems',
      url: 'https://leetcode.com/tag/dynamic-programming/',
    },
    {
      type: 'docs',
      title: 'Educative — Grokking DP Patterns',
      url: 'https://www.educative.io/courses/grokking-dynamic-programming-patterns-for-coding-interviews',
    },
  ],

  recursion: [
    {
      type: 'video',
      title: 'Recursion Crash Course — Traversy Media',
      url: 'https://www.youtube.com/watch?v=mz6tAJMVmfM',
      channel: 'Traversy Media',
    },
    {
      type: 'practice',
      title: 'LeetCode — Recursion Problems',
      url: 'https://leetcode.com/tag/recursion/',
    },
  ],

  sorting: [
    {
      type: 'video',
      title: 'All Sorting Algorithms Explained — CS Dojo',
      url: 'https://www.youtube.com/watch?v=pkkFqlG0Cf4',
      channel: 'CS Dojo',
    },
    {
      type: 'practice',
      title: 'LeetCode — Sorting Problems',
      url: 'https://leetcode.com/tag/sorting/',
    },
  ],

  'binary search': [
    {
      type: 'video',
      title: 'Binary Search — NeetCode',
      url: 'https://www.youtube.com/watch?v=s4DPM8ct1pI',
      channel: 'NeetCode',
      duration: '10:08',
    },
    {
      type: 'practice',
      title: 'LeetCode — Binary Search Problems',
      url: 'https://leetcode.com/tag/binary-search/',
    },
  ],

  'sliding window': [
    {
      type: 'video',
      title: 'Sliding Window Technique — NeetCode',
      url: 'https://www.youtube.com/watch?v=jM2dhDPrlDQ',
      channel: 'NeetCode',
    },
    {
      type: 'practice',
      title: 'LeetCode — Sliding Window Problems',
      url: 'https://leetcode.com/tag/sliding-window/',
    },
  ],

  'two pointers': [
    {
      type: 'video',
      title: 'Two Pointers Technique — NeetCode',
      url: 'https://www.youtube.com/watch?v=On03HWe2tZM',
      channel: 'NeetCode',
    },
    {
      type: 'practice',
      title: 'LeetCode — Two Pointers',
      url: 'https://leetcode.com/tag/two-pointers/',
    },
  ],

  // ── System Design ─────────────────────────────────────────────────────────────
  'system design': [
    {
      type: 'video',
      title: 'System Design Interview — Gaurav Sen',
      url: 'https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX',
      channel: 'Gaurav Sen',
    },
    {
      type: 'docs',
      title: 'System Design Primer — GitHub',
      url: 'https://github.com/donnemartin/system-design-primer',
    },
    {
      type: 'practice',
      title: 'roadmap.sh — System Design',
      url: 'https://roadmap.sh/system-design',
    },
  ],

  'database design': [
    {
      type: 'video',
      title: 'Database Design Course — freeCodeCamp',
      url: 'https://www.youtube.com/watch?v=ztHopE5Wnpc',
      channel: 'freeCodeCamp.org',
      duration: '4:20:00',
    },
    {
      type: 'docs',
      title: 'roadmap.sh — SQL',
      url: 'https://roadmap.sh/sql',
    },
    {
      type: 'practice',
      title: 'SQLZoo — Interactive SQL',
      url: 'https://sqlzoo.net/',
    },
  ],

  caching: [
    {
      type: 'video',
      title: 'Caching Explained — Gaurav Sen',
      url: 'https://www.youtube.com/watch?v=U3RkDLtS7uY',
      channel: 'Gaurav Sen',
    },
    {
      type: 'docs',
      title: 'System Design Primer — Cache',
      url: 'https://github.com/donnemartin/system-design-primer#cache',
    },
  ],

  'load balancing': [
    {
      type: 'video',
      title: 'Load Balancers — System Design',
      url: 'https://www.youtube.com/watch?v=K0Ta65OqQkY',
      channel: 'Gaurav Sen',
    },
    {
      type: 'docs',
      title: 'System Design Primer — Load Balancer',
      url: 'https://github.com/donnemartin/system-design-primer#load-balancer',
    },
  ],

  // ── Frontend / React ──────────────────────────────────────────────────────────
  react: [
    {
      type: 'video',
      title: 'React Full Course — Dave Gray',
      url: 'https://www.youtube.com/watch?v=RVFAyFWO4go',
      channel: 'Dave Gray',
      duration: '9:00:00',
    },
    {
      type: 'docs',
      title: 'React Official Docs',
      url: 'https://react.dev',
    },
    {
      type: 'practice',
      title: 'roadmap.sh — React',
      url: 'https://roadmap.sh/react',
    },
  ],

  'react hooks': [
    {
      type: 'video',
      title: 'React Hooks Explained — Fireship',
      url: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
      channel: 'Fireship',
      duration: '12:54',
    },
    {
      type: 'docs',
      title: 'React Hooks Reference',
      url: 'https://react.dev/reference/react',
    },
    {
      type: 'practice',
      title: 'roadmap.sh — React',
      url: 'https://roadmap.sh/react',
    },
  ],

  'react server components': [
    {
      type: 'video',
      title: 'React Server Components Explained — Fireship',
      url: 'https://www.youtube.com/watch?v=VIwWgV3Lc6s',
      channel: 'Fireship',
    },
    {
      type: 'docs',
      title: 'Next.js — Server Components',
      url: 'https://nextjs.org/docs/app/building-your-application/rendering/server-components',
    },
  ],

  javascript: [
    {
      type: 'video',
      title: 'JavaScript Full Course — freeCodeCamp',
      url: 'https://www.youtube.com/watch?v=jS4aFq5-91M',
      channel: 'freeCodeCamp.org',
    },
    {
      type: 'docs',
      title: 'MDN — JavaScript Guide',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    },
    {
      type: 'practice',
      title: 'roadmap.sh — JavaScript',
      url: 'https://roadmap.sh/javascript',
    },
  ],

  typescript: [
    {
      type: 'video',
      title: 'TypeScript Crash Course — Traversy Media',
      url: 'https://www.youtube.com/watch?v=BCg4U1FzODs',
      channel: 'Traversy Media',
    },
    {
      type: 'docs',
      title: 'TypeScript Handbook',
      url: 'https://www.typescriptlang.org/docs/handbook/',
    },
    {
      type: 'practice',
      title: 'roadmap.sh — TypeScript',
      url: 'https://roadmap.sh/typescript',
    },
  ],

  css: [
    {
      type: 'video',
      title: 'CSS Full Course — Dave Gray',
      url: 'https://www.youtube.com/watch?v=n4R2E7O-Ngo',
      channel: 'Dave Gray',
    },
    {
      type: 'docs',
      title: 'MDN — CSS Reference',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
    },
    {
      type: 'practice',
      title: 'CSS Flexbox Froggy',
      url: 'https://flexboxfroggy.com/',
    },
  ],

  // ── Backend ───────────────────────────────────────────────────────────────────
  nodejs: [
    {
      type: 'video',
      title: 'Node.js Full Course — freeCodeCamp',
      url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
      channel: 'freeCodeCamp.org',
    },
    {
      type: 'docs',
      title: 'Node.js Official Docs',
      url: 'https://nodejs.org/en/docs',
    },
    {
      type: 'practice',
      title: 'roadmap.sh — Node.js',
      url: 'https://roadmap.sh/nodejs',
    },
  ],

  sql: [
    {
      type: 'video',
      title: 'SQL Tutorial — freeCodeCamp',
      url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
      channel: 'freeCodeCamp.org',
      duration: '4:20:00',
    },
    {
      type: 'practice',
      title: 'SQLZoo — Interactive SQL',
      url: 'https://sqlzoo.net/',
    },
    {
      type: 'docs',
      title: 'roadmap.sh — SQL',
      url: 'https://roadmap.sh/sql',
    },
  ],

  'rest apis': [
    {
      type: 'video',
      title: 'REST API Crash Course — Traversy Media',
      url: 'https://www.youtube.com/watch?v=SLwpqD8n3d0',
      channel: 'Traversy Media',
    },
    {
      type: 'docs',
      title: 'MDN — HTTP',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP',
    },
    {
      type: 'practice',
      title: 'roadmap.sh — Backend',
      url: 'https://roadmap.sh/backend',
    },
  ],

  // ── CS Fundamentals ───────────────────────────────────────────────────────────
  'operating systems': [
    {
      type: 'video',
      title: 'Operating Systems — Gate Smashers',
      url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p',
      channel: 'Gate Smashers',
    },
    {
      type: 'docs',
      title: 'OSDev Wiki',
      url: 'https://wiki.osdev.org/',
    },
  ],

  networking: [
    {
      type: 'video',
      title: 'Computer Networking — freeCodeCamp',
      url: 'https://www.youtube.com/watch?v=qiQR5rTSshw',
      channel: 'freeCodeCamp.org',
    },
    {
      type: 'docs',
      title: 'roadmap.sh — Backend (Networking)',
      url: 'https://roadmap.sh/backend',
    },
  ],

  concurrency: [
    {
      type: 'video',
      title: 'Concurrency vs Parallelism — MIT OCW',
      url: 'https://www.youtube.com/watch?v=xtjvQ0I-Vco',
      channel: 'MIT OpenCourseWare',
    },
    {
      type: 'practice',
      title: 'LeetCode — Concurrency Problems',
      url: 'https://leetcode.com/problemset/?topicSlugs=concurrency',
    },
  ],
}

/**
 * Look up static resources for a topic. Tries exact match, then fuzzy match.
 * Returns an empty array if the topic is not found.
 */
export function getStaticResources(topic: string): StaticResource[] {
  const normalised = topic.toLowerCase().trim()

  // 1. Exact match
  if (STATIC_RESOURCES[normalised]) return STATIC_RESOURCES[normalised]

  // 2. Partial key match (e.g. "React Hooks interview" → "react hooks")
  for (const key of Object.keys(STATIC_RESOURCES)) {
    if (normalised.includes(key) || key.includes(normalised)) {
      return STATIC_RESOURCES[key]
    }
  }

  return []
}
