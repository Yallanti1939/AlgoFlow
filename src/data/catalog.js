export const moduleGroups = [
  {
    title: "Arrays",
    focus: "Traversal, insertion, prefix sums, sliding windows, Kadane's algorithm",
    difficulty: "Beginner to Intermediate",
    concepts: ["Array creation", "Traversal", "Insertion", "Deletion", "Kadane's algorithm"],
  },
  {
    title: "Strings",
    focus: "Pattern matching, reversal, palindrome checks, anagrams, compression",
    difficulty: "Beginner to Intermediate",
    concepts: ["String reversal", "Palindrome", "Anagram", "Substring search", "Compression"],
  },
  {
    title: "Searching",
    focus: "Linear and binary search, search bounds, rotated arrays",
    difficulty: "Intermediate",
    concepts: ["Linear search", "Binary search", "Lower bound", "Upper bound", "Rotated search"],
  },
  {
    title: "Sorting",
    focus: "Comparison-based and linear-time sort strategies",
    difficulty: "Intermediate",
    concepts: ["Bubble sort", "Selection sort", "Merge sort", "Quick sort", "Insertion sort"],
  },
  {
    title: "Trees",
    focus: "BST operations, traversals, tree height, LCA, balanced trees",
    difficulty: "Intermediate to Advanced",
    concepts: ["Preorder", "Inorder", "Postorder", "BST", "AVL"],
  },
];

export const quickStats = [
  { label: "AVAILABLE CONCEPTS", value: "16+", detail: "Core modules covered" },
  { label: "VISUALIZATIONS", value: "12", detail: "Interactive algorithm views" },
  { label: "PRACTICE SETS", value: "24", detail: "Curated beginner to advanced tasks" },
];

export const dataStructures = [
  {
    name: "Arrays",
    summary: "Fast indexing with contiguous memory and direct access to elements.",
  },
  {
    name: "Linked Lists",
    summary: "Flexible node-based storage for dynamic insertion and deletion.",
  },
  {
    name: "Stacks",
    summary: "LIFO behavior for recursion, undo flows, and expression evaluation.",
  },
  {
    name: "Queues",
    summary: "FIFO scheduling used in breadth-first traversal and task queues.",
  },
  {
    name: "Trees",
    summary: "Hierarchical data for searches, summaries, and path-based queries.",
  },
  {
    name: "Hash Tables",
    summary: "Key-value lookup with efficient average-case access and updates.",
  },
];

export const practiceProblems = [
  {
    title: "Array Max Subarray",
    difficulty: "Beginner",
    summary: "Find the maximum sum of a contiguous subarray.",
    hint: "Use Kadane's algorithm to keep the current best and running total.",
  },
  {
    title: "Two Sum",
    difficulty: "Beginner",
    summary: "Return the indices of two numbers that add up to a target value.",
    hint: "Track seen values in a hash map as you iterate.",
  },
  {
    title: "Palindrome Check",
    difficulty: "Intermediate",
    summary: "Determine whether a string reads the same forwards and backwards.",
    hint: "Ignore spaces and punctuation before comparing characters.",
  },
  {
    title: "Binary Search Bound",
    difficulty: "Intermediate",
    summary: "Locate the first and last valid index for a target inside a sorted array.",
    hint: "Use low/high boundaries and shrink the search range intentionally.",
  },
];
