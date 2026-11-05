export const stackApplications = [
  {
    id: "balanced-parentheses",
    title: "Balanced Parentheses",
    description: "Check whether a bracket sequence closes correctly.",
    input: "([{}])",
    complexity: "Time: O(n) · Space: O(n)",
    solution: `function isBalanced(expression) {
  const stack = [];

  for (const ch of expression) {
    if ("({[".includes(ch)) {
      stack.push(ch);
    } else {
      const last = stack.pop();
      const matching = { ")": "(", "]": "[", "}": "{" };
      if (matching[ch] !== last) {
        return false;
      }
    }
  }

  return stack.length === 0;
}`,
    explanation: "Push opening brackets and pop only when a matching closing bracket appears. If the stack ends empty, the expression is balanced.",
    runner(input = "([{}])") {
      const stack = [];
      const steps = [{ label: "Start", stack: [...stack], explanation: "Scan the expression from left to right." }];

      for (const ch of input) {
        if ("({[".includes(ch)) {
          stack.push(ch);
          steps.push({ label: `Push ${ch}`, stack: [...stack], explanation: `Open bracket ${ch} goes on the stack.` });
        } else {
          const last = stack.pop();
          const matching = { ")": "(", "]": "[", "}": "{" };
          const valid = matching[ch] === last;
          steps.push({
            label: `Check ${ch}`,
            stack: [...stack],
            explanation: valid ? `Matched ${ch} with ${last}.` : `Mismatch: expected ${matching[ch]} but found ${last ?? "nothing"}.`,
          });

          if (!valid) {
            steps.push({ label: "Result", stack: [...stack], explanation: "The expression is unbalanced." });
            return { ok: false, steps, result: "false" };
          }
        }
      }

      const ok = stack.length === 0;
      steps.push({ label: "Result", stack: [...stack], explanation: ok ? "Every opening bracket was closed." : "Some opening brackets never closed." });
      return { ok, steps, result: String(ok) };
    },
  },
  {
    id: "infix-to-postfix",
    title: "Infix to Postfix",
    description: "Convert infix notation to postfix using operator precedence.",
    input: "A+B*C-D",
    complexity: "Time: O(n) · Space: O(n)",
    solution: `function infixToPostfix(expression) {
  const output = [];
  const stack = [];
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };

  for (const token of expression) {
    if (/[A-Z]/.test(token)) {
      output.push(token);
    } else if (token === "(") {
      stack.push(token);
    } else if (token === ")") {
      while (stack.length && stack[stack.length - 1] !== "(") {
        output.push(stack.pop());
      }
      stack.pop();
    } else {
      while (stack.length && precedence[stack[stack.length - 1]] >= precedence[token]) {
        output.push(stack.pop());
      }
      stack.push(token);
    }
  }

  while (stack.length) output.push(stack.pop());
  return output.join(" ");
}`,
    explanation: "Operators are pushed onto a stack while maintaining precedence; when a closing bracket or lower-precedence operator appears, the stack is popped into the result.",
    runner(input = "A+B*C-D") {
      const output = [];
      const stack = [];
      const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
      const steps = [{ label: "Start", stack: [...stack], output: [...output], explanation: "Read tokens left to right and maintain precedence." }];

      for (const token of input) {
        if (/[A-Z]/.test(token)) {
          output.push(token);
          steps.push({ label: `Add ${token}`, stack: [...stack], output: [...output], explanation: `Operand ${token} goes directly to the output.` });
        } else if (token === "(") {
          stack.push(token);
          steps.push({ label: `Push ${token}`, stack: [...stack], output: [...output], explanation: "Opening bracket is pushed to the operator stack." });
        } else if (token === ")") {
          while (stack.length && stack[stack.length - 1] !== "(") {
            output.push(stack.pop());
          }
          stack.pop();
          steps.push({ label: `Close parenthesis`, stack: [...stack], output: [...output], explanation: "Pop operators until the matching opening bracket is reached." });
        } else {
          while (stack.length && precedence[stack[stack.length - 1]] >= precedence[token]) {
            output.push(stack.pop());
          }
          stack.push(token);
          steps.push({ label: `Push ${token}`, stack: [...stack], output: [...output], explanation: `Operator ${token} is pushed while respecting precedence.` });
        }
      }

      while (stack.length) {
        output.push(stack.pop());
      }

      const result = output.join(" ");
      steps.push({ label: "Result", stack: [...stack], output: [...output], explanation: `Final postfix form: ${result}` });
      return { ok: true, steps, result };
    },
  },
  {
    id: "postfix-evaluation",
    title: "Postfix Expression Evaluation",
    description: "Evaluate an expression written in postfix format.",
    input: "2 3 4 * +",
    complexity: "Time: O(n) · Space: O(n)",
    solution: `function evaluatePostfix(tokens) {
  const stack = [];

  for (const token of tokens) {
    if (!isNaN(Number(token))) {
      stack.push(Number(token));
    } else {
      const right = stack.pop();
      const left = stack.pop();
      switch (token) {
        case "+": stack.push(left + right); break;
        case "-": stack.push(left - right); break;
        case "*": stack.push(left * right); break;
        case "/": stack.push(left / right); break;
      }
    }
  }

  return stack[0];
}`,
    explanation: "Numbers are pushed to the stack, and when an operator appears, the top two values are popped and combined before the result is pushed back.",
    runner(input = "2 3 4 * +") {
      const values = input.split(" ");
      const stack = [];
      const steps = [{ label: "Start", stack: [...stack], explanation: "Process each token left to right." }];

      for (const token of values) {
        if (!Number.isNaN(Number(token))) {
          stack.push(Number(token));
          steps.push({ label: `Push ${token}`, stack: [...stack], explanation: `Numeric token ${token} is pushed to the stack.` });
        } else {
          const right = stack.pop();
          const left = stack.pop();
          const calculated = { "+": left + right, "-": left - right, "*": left * right, "/": left / right }[token];
          stack.push(calculated);
          steps.push({ label: `Apply ${token}`, stack: [...stack], explanation: `Calculate ${left} ${token} ${right} = ${calculated}.` });
        }
      }

      const result = stack[0];
      steps.push({ label: "Result", stack: [...stack], explanation: `The evaluated result is ${result}.` });
      return { ok: true, steps, result: String(result) };
    },
  },
  {
    id: "reverse-string",
    title: "Reverse a String using Stack",
    description: "Use a stack to reverse the characters in a string.",
    input: "ALGORITHM",
    complexity: "Time: O(n) · Space: O(n)",
    solution: `function reverseString(text) {
  const stack = [...text];
  let reversed = "";

  while (stack.length) {
    reversed += stack.pop();
  }

  return reversed;
}`,
    explanation: "Push each character onto the stack and then pop them in reverse order to produce the reversed string.",
    runner(input = "ALGORITHM") {
      const stack = [...input];
      const steps = [{ label: "Start", stack: [...stack], explanation: "Push each character to the stack." }];

      const reversedChars = [];
      while (stack.length) {
        reversedChars.push(stack.pop());
        steps.push({ label: "Pop", stack: [...stack], explanation: `Pop ${reversedChars[reversedChars.length - 1]} and append it to the result.` });
      }

      const result = reversedChars.join("");
      steps.push({ label: "Result", stack: [...stack], explanation: `Final reversed string: ${result}` });
      return { ok: true, steps, result };
    },
  },
  {
    id: "next-greater-element",
    title: "Next Greater Element",
    description: "Find the next larger value to the right of each element.",
    input: "4 2 7 1 9",
    complexity: "Time: O(n) · Space: O(n)",
    solution: `function nextGreaterElement(values) {
  const stack = [];
  const result = new Array(values.length).fill(-1);

  for (let i = 0; i < values.length; i += 1) {
    while (stack.length && values[stack[stack.length - 1]] < values[i]) {
      const index = stack.pop();
      result[index] = values[i];
    }
    stack.push(i);
  }

  return result;
}`,
    explanation: "Maintain a monotonic increasing stack; when a greater element appears, it pops smaller values and assigns them as the next greater element.",
    runner(input = "4 2 7 1 9") {
      const values = input.split(" ").map(Number);
      const stack = [];
      const result = new Array(values.length).fill(-1);
      const steps = [{ label: "Start", stack: [...stack], explanation: "Track indices whose greater element has not yet been found." }];

      for (let i = 0; i < values.length; i += 1) {
        while (stack.length && values[stack[stack.length - 1]] < values[i]) {
          const index = stack.pop();
          result[index] = values[i];
          steps.push({ label: `Resolve ${values[index]}`, stack: [...stack], explanation: `Next greater element for ${values[index]} is ${values[i]}.` });
        }
        stack.push(i);
        steps.push({ label: `Push ${values[i]}`, stack: [...stack], explanation: `Keep ${values[i]} on the stack for future comparisons.` });
      }

      const finalResult = result.join(" ");
      steps.push({ label: "Result", stack: [...stack], explanation: `Final result: ${finalResult}` });
      return { ok: true, steps, result: finalResult };
    },
  },
  {
    id: "min-stack",
    title: "Min Stack",
    description: "Track the minimum value in constant time with a second stack.",
    input: "push 5, push 3, push 8, getMin",
    complexity: "Time: O(1) per operation · Space: O(n)",
    solution: `class MinStack {
  constructor() {
    this.stack = [];
    this.minValues = [];
  }

  push(value) {
    this.stack.push(value);
    const previousMin = this.minValues[this.minValues.length - 1];
    this.minValues.push(previousMin === undefined ? value : Math.min(previousMin, value));
  }

  pop() {
    this.stack.pop();
    this.minValues.pop();
  }

  getMin() {
    return this.minValues[this.minValues.length - 1];
  }
}`,
    explanation: "Keep a second stack that mirrors the minimum value seen so far. The top of the minimum stack always answers getMin in O(1).",
    runner(input = "5, 3, 8") {
      const values = input.split(",").map((item) => Number(item.trim())).filter((item) => !Number.isNaN(item));
      const stack = [];
      const minValues = [];
      const steps = [{ label: "Start", stack: [...stack], explanation: "Maintain a separate minimum stack." }];

      values.forEach((value) => {
        stack.push(value);
        const previousMin = minValues[minValues.length - 1];
        minValues.push(previousMin === undefined ? value : Math.min(previousMin, value));
        steps.push({ label: `Push ${value}`, stack: [...stack], explanation: `Current minimum is ${minValues[minValues.length - 1]}.` });
      });

      const result = minValues[minValues.length - 1];
      steps.push({ label: "Result", stack: [...stack], explanation: `Minimum value in the stack is ${result}.` });
      return { ok: true, steps, result: String(result) };
    },
  },
];

export const modulePracticeSets = {
  linkedLists: [
    {
      title: "Reverse Linked List",
      difficulty: "Easy",
      statement: "Given a singly linked list, reverse the direction of the pointers and return the new head.",
      exampleInput: "1 -> 2 -> 3 -> 4",
      exampleOutput: "4 -> 3 -> 2 -> 1",
      hints: ["Use three pointers: previous, current, and next.", "Keep the current node in memory before changing its next pointer."],
      solution: `function reverseList(head) {
  let previous = null;
  let current = head;

  while (current) {
    const nextNode = current.next;
    current.next = previous;
    previous = current;
    current = nextNode;
  }

  return previous;
}`,
      explanation: "Each node points to the previous node instead of the next one, effectively reversing the list in place.",
      complexity: "Time: O(n) · Space: O(1)",
    },
    {
      title: "Detect Cycle",
      difficulty: "Easy",
      statement: "Determine whether a linked list contains a cycle.",
      exampleInput: "1 -> 2 -> 3 -> 4 -> 2",
      exampleOutput: "Cycle detected",
      hints: ["Use Floyd's cycle-finding algorithm.", "A fast pointer moving twice as fast will eventually catch the slow pointer in a cycle."],
      solution: `function hasCycle(head) {
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;

    if (slow === fast) {
      return true;
    }
  }

  return false;
}`,
      explanation: "The fast pointer moves two nodes per step while the slow pointer moves one. If they meet, the list is cyclic.",
      complexity: "Time: O(n) · Space: O(1)",
    },
  ],
  stacks: [
    {
      title: "Valid Parentheses",
      difficulty: "Easy",
      statement: "Check if a string with brackets is valid and properly nested.",
      exampleInput: "([{}])",
      exampleOutput: "true",
      hints: ["Only opening brackets are pushed to the stack.", "For every closing bracket, compare it against the top of the stack."],
      solution: `function isValidParentheses(s) {
  const map = { ")": "(", "]": "[", "}": "{" };
  const stack = [];

  for (const ch of s) {
    if ("([{".includes(ch)) stack.push(ch);
    else if (map[ch] !== stack.pop()) return false;
  }

  return stack.length === 0;
}`,
      explanation: "The stack ensures each closing bracket matches the most recent opening bracket. Any mismatch means the expression is invalid.",
      complexity: "Time: O(n) · Space: O(n)",
    },
    {
      title: "Daily Temperatures",
      difficulty: "Medium",
      statement: "Given temperature values, return the number of days until a warmer day occurs for each index.",
      exampleInput: "[73, 74, 75, 71, 69, 72, 76, 73]",
      exampleOutput: "[1, 1, 4, 2, 1, 1, 0, 0]",
      hints: ["Use a monotonically decreasing stack.", "Keep indices instead of values when the temperature is lower than the current one."],
      solution: `function dailyTemperatures(temps) {
  const stack = [];
  const result = new Array(temps.length).fill(0);

  for (let i = 0; i < temps.length; i += 1) {
    while (stack.length && temps[stack[stack.length - 1]] < temps[i]) {
      const index = stack.pop();
      result[index] = i - index;
    }
    stack.push(i);
  }

  return result;
}`,
      explanation: "A decreasing temperature stack lets us resolve the next warmer day efficiently without scanning the full array repeatedly.",
      complexity: "Time: O(n) · Space: O(n)",
    },
  ],
  queues: [
    {
      title: "Implement Queue using Stacks",
      difficulty: "Medium",
      statement: "Build a queue with the FIFO property using only stacks.",
      exampleInput: "enqueue 1, enqueue 2, dequeue",
      exampleOutput: "1",
      hints: ["Use one stack for pushing and another for draining.", "Reverse the input stack when the output stack is empty."],
      solution: `class QueueUsingStacks {
  constructor() {
    this.inbox = [];
    this.outbox = [];
  }

  enqueue(value) {
    this.inbox.push(value);
  }

  dequeue() {
    if (!this.outbox.length) {
      while (this.inbox.length) {
        this.outbox.push(this.inbox.pop());
      }
    }

    return this.outbox.pop() ?? null;
  }
}`,
      explanation: "The output stack reverses the order of the input stack so the oldest inserted item is returned first.",
      complexity: "Time: O(n) amortized per dequeue · Space: O(n)",
    },
    {
      title: "Sliding Window Maximum",
      difficulty: "Hard",
      statement: "Return the maximum value in every contiguous window of size k.",
      exampleInput: "[1, 3, -1, -3, 5, 3, 6, 7], k = 3",
      exampleOutput: "[3, 3, 5, 5, 6, 7]",
      hints: ["Use a deque to maintain the window in decreasing order.", "Remove indices that fall out of the window or are smaller than the current candidate."],
      solution: `function maxSlidingWindow(values, k) {
  const deque = [];
  const result = [];

  for (let i = 0; i < values.length; i += 1) {
    while (deque.length && deque[0] <= i - k) deque.shift();
    while (deque.length && values[deque[deque.length - 1]] <= values[i]) deque.pop();
    deque.push(i);

    if (i >= k - 1) result.push(values[deque[0]]);
  }

  return result;
}`,
      explanation: "A deque keeps the indices of candidates in decreasing value order, so the front is always the maximum for the current window.",
      complexity: "Time: O(n) · Space: O(k)",
    },
  ],
  hashing: [
    {
      title: "Two Sum",
      difficulty: "Easy",
      statement: "Find the indices of two numbers whose sum equals a target value.",
      exampleInput: "[2, 7, 11, 15], target = 9",
      exampleOutput: "[0, 1]",
      hints: ["Store seen values in a map by value and index.", "Compute the matching complement for each element as you traverse."],
      solution: `function twoSum(values, target) {
  const seen = new Map();

  for (let i = 0; i < values.length; i += 1) {
    const complement = target - values[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(values[i], i);
  }

  return [];
}`,
      explanation: "A hash map stores the value seen so far, enabling constant-time lookup of the complement needed to reach the target.",
      complexity: "Time: O(n) · Space: O(n)",
    },
    {
      title: "Group Anagrams",
      difficulty: "Medium",
      statement: "Group strings that are permutations of each other together.",
      exampleInput: "[\"eat\", \"tea\", \"tan\", \"ate\", \"nat\", \"bat\"]",
      exampleOutput: "[[\"eat\", \"tea\", \"ate\"], [\"tan\", \"nat\"], [\"bat\"]]",
      hints: ["Use sorted characters as the key in a hash map.", "All anagrams share the same canonical signature."],
      solution: `function groupAnagrams(words) {
  const map = new Map();

  for (const word of words) {
    const key = word.split("").sort().join("");
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(word);
  }

  return [...map.values()];
}`,
      explanation: "Hashing on the sorted character signature groups identical letter sets together with efficient lookups.",
      complexity: "Time: O(n * k log k) · Space: O(n)",
    },
  ],
};

export const complexityPanels = {
  linkedLists: [
    { label: "Insertion at head", details: "Best: O(1) | Average: O(1) | Worst: O(1)", note: "Constant-time pointer reassignment." },
    { label: "Search by value", details: "Best: O(1) | Average: O(n) | Worst: O(n)", note: "Traversal is required unless the list is indexed." },
    { label: "Reverse", details: "Best: O(n) | Average: O(n) | Worst: O(n)", note: "Each node is visited once." },
  ],
  stacks: [
    { label: "Push", details: "Best: O(1) | Average: O(1) | Worst: O(1)", note: "A stack adds to the top in constant time." },
    { label: "Pop", details: "Best: O(1) | Average: O(1) | Worst: O(1)", note: "A stack removes the top element in constant time." },
    { label: "Peek / Min", details: "Best: O(1) | Average: O(1) | Worst: O(1)", note: "The top value or minimum is stored at a known location." },
  ],
  queues: [
    { label: "Enqueue", details: "Best: O(1) | Average: O(1) | Worst: O(1)", note: "For arrays, append on the rear; for circular queues, wrap around when full." },
    { label: "Dequeue", details: "Best: O(1) | Average: O(1) | Worst: O(1)", note: "Remove from the front with a moving head pointer." },
    { label: "Circular queue", details: "Best: O(1) | Average: O(1) | Worst: O(1)", note: "Fixed-size circular buffers reuse space efficiently and avoid memory waste." },
  ],
  hashing: [
    { label: "Insert", details: "Best: O(1) | Average: O(1) | Worst: O(n)", note: "Worst case occurs under heavy clustering or poor hashing." },
    { label: "Search", details: "Best: O(1) | Average: O(1) | Worst: O(n)", note: "Open addressing degrades as collisions increase." },
    { label: "Delete", details: "Best: O(1) | Average: O(1) | Worst: O(n)", note: "Deletion requires careful collision handling and re-probing." },
  ],
};

export const binaryTreeTraversalCode = {
  inorder: {
    summary: "Traverse the left subtree, visit the current node, then traverse the right subtree.",
    code: `function inorder(node) {
  if (!node) return;
  inorder(node.left);
  console.log(node.value);
  inorder(node.right);
}`,
    explanation: "Inorder traversal yields sorted order when a BST is used, and is useful for value-based reasoning." ,
  },
  preorder: {
    summary: "Visit the node before its children.",
    code: `function preorder(node) {
  if (!node) return;
  console.log(node.value);
  preorder(node.left);
  preorder(node.right);
}`,
    explanation: "Preorder traversal is used to copy a tree structure or generate prefix expressions from expression trees.",
  },
  postorder: {
    summary: "Visit the left and right children before the current node.",
    code: `function postorder(node) {
  if (!node) return;
  postorder(node.left);
  postorder(node.right);
  console.log(node.value);
}`,
    explanation: "Postorder traversal is often used for deleting trees and evaluating expression trees from leaves upward.",
  },
  levelorder: {
    summary: "Visit nodes by depth from top to bottom.",
    code: `function levelOrder(root) {
  const queue = [root];

  while (queue.length) {
    const current = queue.shift();
    console.log(current.value);
    if (current.left) queue.push(current.left);
    if (current.right) queue.push(current.right);
  }
}`,
    explanation: "Level-order traversal uses a queue and is ideal for breadth-first search across a tree.",
  },
};

export const binaryTreePracticeSets = [
  {
    title: "Tree Height",
    difficulty: "Easy",
    statement: "Compute the height of a binary tree, where a leaf node has height 0 or 1 depending on convention.",
    exampleInput: "10 -> 5 -> 15 -> 3",
    exampleOutput: "3",
    hints: ["Recursively compute the height of each subtree.", "Take the maximum child height and add one for the current node."],
    solution: `function treeHeight(node) {
  if (!node) return -1;
  return 1 + Math.max(treeHeight(node.left), treeHeight(node.right));
}`,
    explanation: "The height of a tree is the longest path from the root to a leaf, measured in edges.",
    complexity: "Time: O(n) · Space: O(h)",
  },
  {
    title: "Level Order Traversal",
    difficulty: "Medium",
    statement: "Visit each node in a binary tree from top to bottom, left to right.",
    exampleInput: "10, 5, 15, 3, 7",
    exampleOutput: "10, 5, 15, 3, 7",
    hints: ["Use a queue to process nodes breadth-first.", "Enqueue left and right children as you visit the parent."],
    solution: `function levelOrder(root) {
  const queue = [root];
  const result = [];

  while (queue.length) {
    const current = queue.shift();
    result.push(current.value);
    if (current.left) queue.push(current.left);
    if (current.right) queue.push(current.right);
  }

  return result;
}`,
    explanation: "Level-order traversal is the tree equivalent of breadth-first search and is perfect for exploring a tree by depth.",
    complexity: "Time: O(n) · Space: O(w)",
  },
];

export const binaryTreeComplexity = [
  {
    title: "Traversal",
    description: "Each node is visited once in preorder, inorder, postorder, or level-order traversal: O(n) time and O(h) recursion stack in depth-first modes.",
  },
  {
    title: "Insertion",
    description: "Average-case insertion in a balanced BST is O(log n), but an unbalanced tree can degrade to O(n) in the worst case.",
  },
  {
    title: "Search",
    description: "Binary search on a tree is efficient when the tree stays balanced. Repeated imbalance makes search performance degrade toward linear time.",
  },
];

export const bstTraversalCode = {
  inorder: {
    summary: "Visit left subtree, current node, then right subtree.",
    code: `function inorder(node) {
  if (!node) return;
  inorder(node.left);
  console.log(node.value);
  inorder(node.right);
}`,
    explanation: "Inorder traversal yields values in ascending order for a valid BST.",
  },
  preorder: {
    summary: "Visit the current node before both subtrees.",
    code: `function preorder(node) {
  if (!node) return;
  console.log(node.value);
  preorder(node.left);
  preorder(node.right);
}`,
    explanation: "Preorder is useful for generating prefix representations and copying tree structure.",
  },
  postorder: {
    summary: "Visit the children before the current node.",
    code: `function postorder(node) {
  if (!node) return;
  postorder(node.left);
  postorder(node.right);
  console.log(node.value);
}`,
    explanation: "Postorder is often used for tree cleanup and expression tree evaluation.",
  },
  levelorder: {
    summary: "Visit nodes breadth-first by depth.",
    code: `function levelOrder(root) {
  const queue = [root];

  while (queue.length) {
    const current = queue.shift();
    console.log(current.value);
    if (current.left) queue.push(current.left);
    if (current.right) queue.push(current.right);
  }
}`,
    explanation: "Level-order traversal uses a queue and processes the tree one layer at a time.",
  },
};

export const bstPracticeSets = [
  {
    title: "BST Search",
    difficulty: "Easy",
    statement: "Search for a value in a BST and return the matching node or null.",
    exampleInput: "Tree: 50,30,70; Search: 40",
    exampleOutput: "null",
    hints: ["At each node, compare the target value with the current node.", "Move left when the target is smaller and right when it is larger."],
    solution: `function search(root, target) {
  let current = root;

  while (current) {
    if (target === current.value) return current;
    current = target < current.value ? current.left : current.right;
  }

  return null;
}`,
    explanation: "Each comparison eliminates half of the remaining search space, leading to logarithmic average time in a balanced BST.",
    complexity: "Time: O(log n) average · Space: O(1)",
  },
  {
    title: "Delete from BST",
    difficulty: "Medium",
    statement: "Delete a node from a BST while preserving the ordering property.",
    exampleInput: "Tree: 50,30,70,20,40,60,80; Delete: 30",
    exampleOutput: "50,20,40,70,60,80",
    hints: ["If the node is a leaf, remove it directly.", "If it has one child, replace it with that child.", "If it has two children, swap in the inorder successor or predecessor."],
    solution: `function deleteNode(root, value) {
  if (!root) return null;

  if (value < root.value) {
    root.left = deleteNode(root.left, value);
    return root;
  }

  if (value > root.value) {
    root.right = deleteNode(root.right, value);
    return root;
  }

  if (!root.left && !root.right) return null;
  if (!root.left) return root.right;
  if (!root.right) return root.left;

  const successor = minValue(root.right);
  root.value = successor.value;
  root.right = deleteNode(root.right, successor.value);
  return root;
}`,
    explanation: "Deletion must preserve the BST invariant by reattaching children carefully and, when needed, replacing the node with its inorder successor.",
    complexity: "Time: O(log n) average · Space: O(h)",
  },
];

export const bstComplexity = [
  {
    title: "Search",
    description: "Average-case search is O(log n) because each comparison moves down one level. The worst case is O(n) when the tree becomes skewed.",
  },
  {
    title: "Insert",
    description: "Insertion is O(log n) on average with a balanced tree, but it can degrade to O(n) in a degenerate case with all values in order.",
  },
  {
    title: "Delete",
    description: "Deletion follows the same average-case behavior as search and insertion. In-order successor or predecessor replacement keeps the tree ordered.",
  },
];

export const avlTraversalCode = {
  inorder: {
    summary: "Visit the left subtree, the node, and the right subtree in-order.",
    code: `function inorder(node) {
  if (!node) return;
  inorder(node.left);
  console.log(node.value);
  inorder(node.right);
}`,
    explanation: "Inorder traversal yields sorted order for any valid BST, and AVL trees preserve that property after each rotation.",
  },
  preorder: {
    summary: "Visit the node before its children.",
    code: `function preorder(node) {
  if (!node) return;
  console.log(node.value);
  preorder(node.left);
  preorder(node.right);
}`,
    explanation: "Preorder is useful for copying the tree structure and for producing prefix expressions from expression trees.",
  },
  postorder: {
    summary: "Visit the children before the parent node.",
    code: `function postorder(node) {
  if (!node) return;
  postorder(node.left);
  postorder(node.right);
  console.log(node.value);
}`,
    explanation: "Postorder is a natural fit for cleanup and post-processing after a subtree is fully explored.",
  },
  levelorder: {
    summary: "Process the tree breadth-first by depth.",
    code: `function levelOrder(root) {
  const queue = [root];

  while (queue.length) {
    const current = queue.shift();
    console.log(current.value);
    if (current.left) queue.push(current.left);
    if (current.right) queue.push(current.right);
  }
}`,
    explanation: "Level-order traversal visits nodes by depth and is commonly used in breadth-first tree exploration.",
  },
};

export const avlPracticeSets = [
  {
    title: "AVL Insertions",
    difficulty: "Easy",
    statement: "Insert values into an AVL tree and maintain the balance factor constraint after every operation.",
    exampleInput: "30, 20, 10",
    exampleOutput: "10, 20, 30",
    hints: ["Check the balance factor after insertion.", "Rotate the subtree according to the imbalance pattern."],
    solution: `function insertAVL(root, value) {
  if (!root) return { value, left: null, right: null, height: 1 };

  if (value < root.value) {
    root.left = insertAVL(root.left, value);
  } else {
    root.right = insertAVL(root.right, value);
  }

  root.height = 1 + Math.max(height(root.left), height(root.right));
  const balance = height(root.left) - height(root.right);

  if (balance > 1 && value < root.left.value) return rotateRight(root);
  if (balance < -1 && value > root.right.value) return rotateLeft(root);
  if (balance > 1 && value > root.left.value) {
    root.left = rotateLeft(root.left);
    return rotateRight(root);
  }
  if (balance < -1 && value < root.right.value) {
    root.right = rotateRight(root.right);
    return rotateLeft(root);
  }

  return root;
}`,
    explanation: "Each insertion updates the node height and checks the balance factor. Violations trigger one or two rotations to restore the AVL property.",
    complexity: "Time: O(log n) · Space: O(h)",
  },
  {
    title: "AVL Delete",
    difficulty: "Medium",
    statement: "Delete a node and rebalance the tree using the appropriate rotation after the removal.",
    exampleInput: "Tree: 30, 20, 40, 10, 25, 35, 50; Delete: 20",
    exampleOutput: "10, 25, 30, 35, 40, 50",
    hints: ["Use the inorder successor for a node with two children.", "After replacement, recompute height and rebalance."],
    solution: `function deleteAVL(root, value) {
  if (!root) return null;
  if (value < root.value) root.left = deleteAVL(root.left, value);
  else if (value > root.value) root.right = deleteAVL(root.right, value);
  else {
    if (!root.left || !root.right) return root.left ?? root.right;
    const successor = minNode(root.right);
    root.value = successor.value;
    root.right = deleteAVL(root.right, successor.value);
  }

  root.height = 1 + Math.max(height(root.left), height(root.right));
  return rebalance(root);
}`,
    explanation: "Rebalancing after deletion follows the same logic as insertion. The subtree is restored to the allowed height difference of at most one.",
    complexity: "Time: O(log n) · Space: O(h)",
  },
];

export const avlComplexity = [
  {
    title: "Search",
    description: "AVL search is O(log n) because each comparison moves down one level. Unlike BSTs, the tree remains balanced after every update.",
  },
  {
    title: "Insertion",
    description: "Insertion updates the balance factor along the insertion path and applies at most one or two rotations, so the total work stays logarithmic.",
  },
  {
    title: "Deletion",
    description: "Deletion also maintains O(log n) time because it performs a localized rebalancing step after the node is removed and replaced.",
  },
  {
    title: "Rotation cost",
    description: "Single and double rotations are constant-time operations on the local subtree, which keeps the entire AVL rebalancing step bounded by the tree height.",
  },
];

export const heapCode = {
  summary: "Heapify is the core operation that preserves the ordering invariant after inserts and deletions.",
  code: `function heapifyDown(values, index) {
  const left = 2 * index + 1;
  const right = 2 * index + 2;
  let smallest = index;

  if (left < values.length && values[left] < values[smallest]) smallest = left;
  if (right < values.length && values[right] < values[smallest]) smallest = right;

  if (smallest !== index) {
    [values[index], values[smallest]] = [values[smallest], values[index]];
    heapifyDown(values, smallest);
  }
}`,
  explanation: "Heapify restores the parent-child constraint in place using the local subtree. This makes insert, extract, and build operations efficient.",
};

export const heapPracticeSets = [
  {
    title: "Kth Largest Element",
    difficulty: "Medium",
    statement: "Use a max-heap to find the kth largest number in an array without sorting the full collection.",
    exampleInput: "[3, 2, 1, 5, 6, 4], k = 2",
    exampleOutput: "5",
    hints: ["Keep a heap of size k.", "When a new value arrives, push it if the heap is smaller than k; otherwise, replace the root when it is smaller than the root."],
    solution: `function kthLargest(values, k) {
  const heap = values.slice(0, k).sort((a, b) => a - b);

  for (let i = k; i < values.length; i += 1) {
    if (values[i] > heap[0]) {
      heap[0] = values[i];
      heap.sort((a, b) => a - b);
    }
  }

  return heap[0];
}`,
    explanation: "A min-heap of the top k elements keeps the root as the smallest item among the selected candidates, enabling efficient retrieval of the kth largest value.",
    complexity: "Time: O(n log k) · Space: O(k)",
  },
  {
    title: "Merge K Sorted Lists",
    difficulty: "Hard",
    statement: "Combine k sorted lists into one sorted output using a min-heap of the current list heads.",
    exampleInput: "[[1, 4, 7], [2, 5, 8], [3, 6, 9]]",
    exampleOutput: "[1, 2, 3, 4, 5, 6, 7, 8, 9]",
    hints: ["Push the first element of each list into a min-heap.", "Repeatedly extract the smallest value and push the next value from that same list."],
    solution: `function mergeKSorted(lists) {
  const heap = [];
  const output = [];

  lists.forEach((list, index) => {
    if (list.length) heap.push({ value: list[0], listIndex: index, index: 0 });
  });

  while (heap.length) {
    const smallest = heap.shift();
    output.push(smallest.value);
    const nextIndex = smallest.index + 1;
    if (nextIndex < lists[smallest.listIndex].length) {
      heap.push({ value: lists[smallest.listIndex][nextIndex], listIndex: smallest.listIndex, index: nextIndex });
    }
  }

  return output;
}`,
    explanation: "The heap always stores the next smallest candidate from each list, making it easy to merge many sorted sequences in near-optimal time.",
    complexity: "Time: O(n log k) · Space: O(k)",
  },
];

export const heapComplexity = [
  {
    title: "Insert",
    description: "Insertion into a heap requires heapify-up and costs O(log n) because the value only moves along the path from the leaf to the root.",
  },
  {
    title: "Extract min/max",
    description: "Extracting the root replaces it with the last item and sinks it downward, which is also O(log n) in the worst case.",
  },
  {
    title: "Build heap",
    description: "Building a heap from an arbitrary array uses repeated heapify-down from the last non-leaf node, giving O(n) total time.",
  },
  {
    title: "Priority queue",
    description: "Heaps excel at priority queue operations because they keep the most important value at the front while supporting efficient insertion and extraction.",
  },
];

export const heapSortCode = {
  summary: "Heap sort builds a max heap, swaps the root into the sorted tail, and then reheapifies the remaining heap.",
  code: `function heapSort(values) {
  let end = values.length - 1;

  for (let index = Math.floor(values.length / 2) - 1; index >= 0; index -= 1) {
    heapifyDown(values, index, values.length);
  }

  while (end > 0) {
    [values[0], values[end]] = [values[end], values[0]];
    heapifyDown(values, 0, end);
    end -= 1;
  }

  return values;
}

function heapifyDown(values, index, endIndex) {
  let current = index;
  while (true) {
    const left = 2 * current + 1;
    const right = 2 * current + 2;
    let largest = current;

    if (left < endIndex && values[left] > values[largest]) largest = left;
    if (right < endIndex && values[right] > values[largest]) largest = right;

    if (largest === current) break;

    [values[current], values[largest]] = [values[largest], values[current]];
    current = largest;
  }
}`,
  explanation: "Heap sort is in-place and uses the heap ordering to move the largest remaining value to the end of the array on each pass, ensuring the final result is sorted ascending.",
};

export const heapSortPracticeSets = [
  {
    title: "Sort a nearly sorted array",
    difficulty: "Easy",
    statement: "Use heap sort to sort an array where most elements are already in order but one or two values are out of place.",
    exampleInput: "[2, 1, 3, 5, 4]",
    exampleOutput: "[1, 2, 3, 4, 5]",
    hints: ["Build a max heap first.", "Swap the root with the end of the active heap and then reheapify the front."],
    solution: `function heapSort(values) {
  let end = values.length - 1;

  for (let i = Math.floor(values.length / 2) - 1; i >= 0; i -= 1) {
    heapifyDown(values, i, values.length);
  }

  while (end > 0) {
    [values[0], values[end]] = [values[end], values[0]];
    heapifyDown(values, 0, end);
    end -= 1;
  }

  return values;
}

function heapifyDown(values, index, endIndex) {
  let current = index;
  while (true) {
    const left = 2 * current + 1;
    const right = 2 * current + 2;
    let largest = current;

    if (left < endIndex && values[left] > values[largest]) largest = left;
    if (right < endIndex && values[right] > values[largest]) largest = right;

    if (largest === current) return;
    [values[current], values[largest]] = [values[largest], values[current]];
    current = largest;
  }
}`,
    explanation: "The heap property guarantees that the maximum value is always at the root, so each pass moves a correct element into its final sorted position.",
    complexity: "Time: O(n log n) · Space: O(1)",
  },
  {
    title: "Find the kth largest value",
    difficulty: "Medium",
    statement: "Use heap sort logic to find the kth largest value without needing a full sort when an array is large.",
    exampleInput: "[7, 3, 9, 2, 1, 5], k = 3",
    exampleOutput: "5",
    hints: ["Build a max heap and keep shrinking the unsorted window.", "The kth largest value eventually lands at index k - 1 after repeated extraction."],
    solution: `function kthLargest(values, k) {
  let end = values.length - 1;

  for (let i = Math.floor(values.length / 2) - 1; i >= 0; i -= 1) {
    heapifyDown(values, i, values.length);
  }

  while (end > values.length - k) {
    [values[0], values[end]] = [values[end], values[0]];
    heapifyDown(values, 0, end);
    end -= 1;
  }

  return values[values.length - k];
}`,
    explanation: "After the heap is built, each extraction moves the next largest element to the end. The kth largest value ends up in the expected index without requiring a full extra array.",
    complexity: "Time: O(n log n) · Space: O(1)",
  },
];

export const heapSortComplexity = [
  {
    title: "Build heap",
    description: "Building the max heap from an unsorted array takes O(n) time because each internal node is heapified once and the cost is dominated by the lower levels of the tree.",
  },
  {
    title: "Sort phase",
    description: "Each extraction from the root to the end of the unsorted portion costs O(log n), and this happens n times, resulting in O(n log n) total sorting time.",
  },
  {
    title: "Space usage",
    description: "Heap sort sorts in place, so it uses O(1) auxiliary space even though the max-heap structure is maintained within the same array.",
  },
  {
    title: "When it shines",
    description: "Heap sort is predictable and efficient for large datasets where a fixed, constant extra memory footprint matters more than stable ordering.",
  },
];

export const segmentTreeCode = {
  summary: "Segment trees split an array into intervals and store aggregate values at each node, enabling efficient range queries and updates.",
  code: `function segmentTreeQuery(tree, left, right, queryLeft, queryRight) {
  if (queryRight < left || queryLeft > right) return 0;
  if (queryLeft <= left && right <= queryRight) return tree[node];

  pushLazy(tree, node, left, right);
  const mid = Math.floor((left + right) / 2);
  return segmentTreeQuery(tree, left, mid, queryLeft, queryRight)
    + segmentTreeQuery(tree, mid + 1, right, queryLeft, queryRight);
}`,
  explanation: "Each node summarises its segment, and lazy propagation defers expensive updates until a query actually needs the affected children.",
};

export const segmentTreePracticeSets = [
  {
    title: "Range sum with prefix updates",
    difficulty: "Easy",
    statement: "Use a segment tree to maintain a running total for several range additions and compute the sum of a chosen interval.",
    exampleInput: "[5, 3, 8, 2], add 3 to [1, 3], query [0, 2]",
    exampleOutput: "18",
    hints: ["Store a range sum at each node.", "Apply lazy propagation when the update covers an interval."],
    solution: `function rangeAddAndSum(values, left, right, delta, queryLeft, queryRight) {
  const tree = new SegmentTree(values);
  tree.rangeUpdate(left, right, delta);
  return tree.rangeSumQuery(queryLeft, queryRight).at(-1).result;
}`,
    explanation: "The tree stores prefix-friendly aggregates, and the lazy update guarantees that later queries still return correct totals without revisiting every leaf.",
    complexity: "Time: O(log n) per update/query · Space: O(n)",
  },
  {
    title: "Track minimum in a range",
    difficulty: "Medium",
    statement: "Support point updates and range minimum queries while preserving efficient indexing and rebalancing.",
    exampleInput: "[7, 2, 5, 1, 9], query [1, 4]",
    exampleOutput: "1",
    hints: ["Store the minimum value in each node.", "Recompute the parent after every affected child update."],
    solution: `function rangeMin(values, left, right) {
  const tree = new SegmentTree(values);
  return tree.rangeMinQuery(left, right).at(-1).result;
}`,
    explanation: "The minimum value for a node is the minimum of its left and right children, which keeps all queried intervals efficient and exact.",
    complexity: "Time: O(log n) per query · Space: O(n)",
  },
];

export const segmentTreeComplexity = [
  {
    title: "Build",
    description: "Constructing a segment tree from n values takes O(n) time because each node is assigned once while combining child contributions.",
  },
  {
    title: "Range sum query",
    description: "A range sum query visits O(log n) nodes in a balanced segment tree, making it suitable for repeated aggregate queries.",
  },
  {
    title: "Range minimum query",
    description: "Minimum queries use the same recursive interval split and also require O(log n) time in the balanced case.",
  },
  {
    title: "Lazy propagation",
    description: "Range updates with lazy propagation can avoid descending into every child for each change, turning large update batches into efficient O(log n) work while preserving correctness.",
  },
];

export const fenwickTreeCode = {
  summary: "Fenwick trees maintain partial sums so each update and prefix query only walks a logarithmic path through the BIT.",
  code: `function fenwickPrefixSum(tree, index) {
  let result = 0;
  while (index > 0) {
    result += tree[index];
    index -= index & -index;
  }
  return result;
}

function fenwickAdd(tree, index, delta) {
  const size = tree.length - 1;
  while (index <= size) {
    tree[index] += delta;
    index += index & -index;
  }
}`,
  explanation: "Fenwick trees trade a compact index representation for fast cumulative sums. A range sum is just the difference of two prefix sums, and updates only touch the relevant ancestor indices.",
};

export const fenwickTreePracticeSets = [
  {
    title: "Prefix totals",
    difficulty: "Easy",
    statement: "Use a Fenwick tree to compute how many total units appear in the first n positions of a numeric array.",
    exampleInput: "[3, 1, 4, 2], prefix to index 3",
    exampleOutput: "10",
    hints: ["Use the BIT to accumulate partial sums.", "A prefix sum walks the index ancestors until it reaches zero."],
    solution: `function prefixTotal(values, lastIndex) {
  const bit = new FenwickTree(values);
  return bit.prefixSum(lastIndex).at(-1).result;
}`,
    explanation: "The BIT stores partial sums at each prefix, and querying a prefix simply aggregates the necessary ancestor nodes.",
    complexity: "Time: O(log n) · Space: O(n)",
  },
  {
    title: "Range subtotal",
    difficulty: "Medium",
    statement: "Use two prefix queries to compute the sum over any contiguous interval in an array of integers.",
    exampleInput: "[5, 2, 9, 1, 7], range [1, 4]",
    exampleOutput: "19",
    hints: ["Compute prefix(right) - prefix(left - 1).", "The BIT gives an efficient cumulative answer for both sides."],
    solution: `function rangeTotal(values, left, right) {
  const bit = new FenwickTree(values);
  return bit.rangeSum(left, right).at(-1).result;
}`,
    explanation: "Fenwick trees turn a range sum into a subtraction of two prefix totals, keeping the computation efficient with minimal state.",
    complexity: "Time: O(log n) · Space: O(n)",
  },
];

export const fenwickTreeComplexity = [
  {
    title: "Build",
    description: "Constructing the BIT from n values takes O(n log n) when each element is updated into the tree, but the compact structure still offers efficient queries afterward.",
  },
  {
    title: "Prefix sums",
    description: "A prefix sum touches O(log n) BIT entries, making cumulative totals efficient for repeated analysis and online updates.",
  },
  {
    title: "Point updates",
    description: "Updating one element changes the relevant ancestor nodes only, so a single point modification remains O(log n).",
  },
  {
    title: "Range queries",
    description: "The difference of two prefix sums yields a range total in O(log n), which is especially efficient for large arrays with frequent reads.",
  },
];

export const graphFundamentalsCode = {
  summary: "Graphs capture relationships with vertices and edges. Adjacency lists are ideal for sparse graphs, while adjacency matrices are convenient for dense graphs and direct lookup.",
  code: `class Graph {
  constructor({ directed = false, weighted = false } = {}) {
    this.directed = directed;
    this.weighted = weighted;
    this.vertices = [];
    this.adjacency = new Map();
  }

  addVertex(vertex) {
    if (this.vertices.includes(vertex)) return false;
    this.vertices.push(vertex);
    this.adjacency.set(vertex, new Map());
    return true;
  }

  addEdge(from, to, weight = 1) {
    if (!this.adjacency.has(from) || !this.adjacency.has(to)) return false;
    this.adjacency.get(from).set(to, this.weighted ? Number(weight) : 1);
    if (!this.directed) this.adjacency.get(to).set(from, this.weighted ? Number(weight) : 1);
    return true;
  }

  getNeighbors(vertex) {
    return [...(this.adjacency.get(vertex) ?? new Map()).entries()].map(([neighbor, weight]) => ({
      vertex: neighbor,
      weight,
    }));
  }
}`,
  explanation: "A graph is a data model for connections. The best representation depends on graph density and whether you need fast neighbor iteration or direct matrix lookup.",
};

export const graphFundamentalsComplexity = [
  {
    title: "Vertex addition",
    description: "Adding a vertex is O(1) because we append the label and create a fresh adjacency list for it.",
  },
  {
    title: "Edge addition",
    description: "Adding a directed or undirected edge is O(1) in the adjacency list representation, assuming the endpoint vertices already exist.",
  },
  {
    title: "Neighbor lookup",
    description: "Retrieving all neighbors costs O(deg(v)), the number of edges touching that vertex, which is efficient for sparse graphs.",
  },
  {
    title: "Matrix representation",
    description: "An adjacency matrix gives constant-time edge checks but requires O(V^2) space, which is often too expensive for large sparse graphs.",
  },
];

export const graphFundamentalsPracticeSets = [
  {
    title: "Represent a social network",
    difficulty: "Easy",
    statement: "Build a graph for a small social network where each person is a vertex and friendships are undirected edges.",
    exampleInput: "Vertices: Alice, Bob, Carol; edges: Alice-Bob, Bob-Carol",
    exampleOutput: "Alice: [Bob], Bob: [Alice, Carol], Carol: [Bob]",
    hints: ["Use an undirected graph.", "Store each person's neighbors in a list."],
    solution: `function buildSocialGraph() {
  const graph = new Graph({ directed: false, weighted: false });
  ["Alice", "Bob", "Carol"].forEach((person) => graph.addVertex(person));
  ["Alice", "Bob", "Bob", "Carol"].forEach((person, index) => {
    if (index === 0) graph.addEdge("Alice", "Bob");
    else graph.addEdge("Bob", "Carol");
  });
  return graph.adjacencyList();
}`,
    explanation: "An undirected adjacency list naturally captures mutual relationships, making it easy to inspect each person's friends and degrees.",
    complexity: "Time: O(V + E) · Space: O(V + E)",
  },
  {
    title: "Check graph connectivity",
    difficulty: "Medium",
    statement: "Determine whether the graph is connected or whether it has separate components using degree and neighbor inspection.",
    exampleInput: "Vertices A, B, C, D with edges A-B and C-D",
    exampleOutput: "Disconnected",
    hints: ["Track visited vertices.", "A connected component is reachable from any starting vertex."],
    solution: `function isConnected(graph, start) {
  const visited = new Set();
  const stack = [start];

  while (stack.length) {
    const current = stack.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    for (const neighbor of graph.getNeighbors(current)) {
      if (!visited.has(neighbor.vertex)) stack.push(neighbor.vertex);
    }
  }

  return visited.size === graph.vertices.length;
}`,
    explanation: "A graph is connected when a traversal from one vertex reaches every other vertex. This is the basis for many graph-processing and network-analysis algorithms.",
    complexity: "Time: O(V + E) · Space: O(V)",
  },
];

export const bfsCode = {
  summary: "BFS visits vertices level by level, using a queue to ensure each newly discovered node is processed in discovery order.",
  code: `function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const parents = { [start]: null };
  const distances = { [start]: 0 };
  const order = [];

  while (queue.length) {
    const current = queue.shift();
    order.push(current);

    for (const neighbor of graph.getNeighbors(current)) {
      if (visited.has(neighbor.vertex)) continue;
      visited.add(neighbor.vertex);
      parents[neighbor.vertex] = current;
      distances[neighbor.vertex] = distances[current] + 1;
      queue.push(neighbor.vertex);
    }
  }

  return { order, parents, distances };
}`,
  explanation: "The queue preserves discovery order, so BFS reaches vertices in increasing distance from the source. This is why the first time a vertex is seen gives the shortest path in an unweighted graph.",
};

export const bfsComplexity = [
  {
    title: "Adjacency list",
    description: "With an adjacency list, BFS touches each vertex and edge once, giving O(V + E) time and O(V) extra space for the queue and visited set.",
  },
  {
    title: "Adjacency matrix",
    description: "A matrix-based graph can check neighbors by scanning a row, leading to O(V^2) time even though the traversal logic remains the same.",
  },
  {
    title: "Shortest path guarantee",
    description: "Because BFS expands level by level, the first time we reach a vertex is the shortest path in an unweighted graph.",
  },
  {
    title: "Disconnected graphs",
    description: "If the starting vertex cannot reach part of the graph, those vertices remain unvisited and are simply not part of the BFS tree from that source.",
  },
];

export const bfsPracticeSets = [
  {
    title: "Social network levels",
    difficulty: "Easy",
    statement: "Use BFS to find every person reachable from a starting profile and record each person's distance from that source.",
    exampleInput: "Start at Alice; edges: Alice-Bob, Alice-Carol, Bob-Dan, Carol-Eve",
    exampleOutput: "Alice: 0, Bob: 1, Carol: 1, Dan: 2, Eve: 2",
    hints: ["Queue the starting vertex first.", "Each newly discovered vertex gets a distance one more than its parent."],
    solution: `function bfsDistances(graph, start) {
  const queue = [start];
  const visited = new Set([start]);
  const distances = { [start]: 0 };

  while (queue.length) {
    const current = queue.shift();
    for (const neighbor of graph.getNeighbors(current)) {
      if (!visited.has(neighbor.vertex)) {
        visited.add(neighbor.vertex);
        distances[neighbor.vertex] = distances[current] + 1;
        queue.push(neighbor.vertex);
      }
    }
  }

  return distances;
}`,
    explanation: "Distance values are assigned when a vertex is discovered, guaranteeing that BFS records the minimum number of edges from the source to every reachable vertex.",
    complexity: "Time: O(V + E) · Space: O(V)",
  },
  {
    title: "Reconstruct the shortest route",
    difficulty: "Medium",
    statement: "Record the parent of each vertex during BFS and reconstruct the shortest path to a goal node.",
    exampleInput: "Source A, goal F; graph A-B, A-C, B-D, C-E, D-F",
    exampleOutput: "A -> B -> D -> F",
    hints: ["Set parent[neighbor] = current when a vertex is first discovered.", "Rebuild the path by walking backward from the goal."],
    solution: `function shortestPath(graph, start, goal) {
  const queue = [start];
  const visited = new Set([start]);
  const parents = { [start]: null };

  while (queue.length) {
    const current = queue.shift();
    if (current === goal) break;

    for (const neighbor of graph.getNeighbors(current)) {
      if (!visited.has(neighbor.vertex)) {
        visited.add(neighbor.vertex);
        parents[neighbor.vertex] = current;
        queue.push(neighbor.vertex);
      }
    }
  }

  const path = [goal];
  let current = goal;
  while (parents[current] !== null) {
    current = parents[current];
    path.unshift(current);
  }

  return path;
}`,
    explanation: "Once BFS assigns a parent to each discovered vertex, the shortest path is simply the chain of ancestors leading back to the source.",
    complexity: "Time: O(V + E) · Space: O(V)",
  },
];

export const dfsCode = {
  summary: "DFS explores one branch to its end before backtracking. The recursive method uses the call stack; the iterative method stores traversal frames explicitly.",
  code: `function dfs(graph, start) {
  const visited = new Set();
  const parents = { [start]: null };
  const order = [];

  function visit(vertex) {
    visited.add(vertex);
    order.push(vertex);

    for (const { vertex: neighbor } of graph.getNeighbors(vertex)) {
      if (visited.has(neighbor)) continue;
      parents[neighbor] = vertex;
      visit(neighbor);
    }
  }

  visit(start);
  return { order, parents };
}`,
  explanation: "Each vertex is marked before its neighbors are explored, preventing cycles from causing repeated visits. An iterative implementation can use explicit frames to reproduce the same traversal order.",
};

export const dfsIterativeCode = {
  summary: "The iterative version stores each active vertex and its next-neighbor position in an explicit stack, mirroring recursive call frames.",
  code: `function iterativeDfs(graph, start) {
  const visited = new Set([start]);
  const parents = { [start]: null };
  const order = [start];
  const stack = [{
    vertex: start,
    neighbors: graph.getNeighbors(start),
    index: 0,
  }];

  while (stack.length) {
    const frame = stack[stack.length - 1];

    if (frame.index === frame.neighbors.length) {
      stack.pop();
      continue;
    }

    const neighbor = frame.neighbors[frame.index++].vertex;
    if (visited.has(neighbor)) continue;

    visited.add(neighbor);
    parents[neighbor] = frame.vertex;
    order.push(neighbor);
    stack.push({
      vertex: neighbor,
      neighbors: graph.getNeighbors(neighbor),
      index: 0,
    });
  }

  return { order, parents };
}`,
  explanation: "A frame remembers which neighbor will be considered next. Pushing a new frame descends; popping an exhausted frame backtracks, reproducing recursive DFS order without JavaScript recursion.",
};

export const dfsComplexity = [
  {
    title: "Adjacency list",
    description: "DFS examines every reachable vertex and each outgoing edge at most once, for O(V + E) time. The visited set and traversal path use O(V) auxiliary space.",
  },
  {
    title: "Adjacency matrix",
    description: "For each visited vertex, DFS scans an entire matrix row to find neighbors, yielding O(V²) time.",
  },
  {
    title: "Recursive versus iterative",
    description: "Both approaches use O(V) worst-case auxiliary space. Recursion is concise but can reach JavaScript call-stack limits on very deep graphs; an explicit stack avoids that runtime limitation.",
  },
  {
    title: "Disconnected graphs",
    description: "A traversal from one start visits only vertices reachable along outgoing edges. The remaining vertices are reported as unreachable rather than silently treated as part of this DFS tree.",
  },
];

export const dfsPracticeSets = [
  {
    title: "Reachability in a network",
    difficulty: "Easy",
    statement: "Starting at a given vertex, list all vertices reachable by following the graph's edges.",
    exampleInput: "Start A; edges A-B, B-C, A-D",
    exampleOutput: "A, B, C, D",
    hints: ["Mark each vertex before exploring its neighbors.", "Use a visited set to avoid revisiting cycles."],
    solution: `function reachableVertices(graph, start) {
  const visited = new Set();

  function visit(vertex) {
    if (visited.has(vertex)) return;
    visited.add(vertex);
    for (const { vertex: neighbor } of graph.getNeighbors(vertex)) {
      visit(neighbor);
    }
  }

  visit(start);
  return [...visited];
}`,
    explanation: "Recursive calls follow one path until it ends, then return to explore another branch. The visited set guarantees termination even when cycles exist.",
    complexity: "Time: O(V + E) · Space: O(V)",
  },
  {
    title: "Count connected components",
    difficulty: "Medium",
    statement: "For an undirected graph, count how many connected components it contains.",
    exampleInput: "Vertices A, B, C, D, E; edges A-B and C-D",
    exampleOutput: "3 components",
    hints: ["Iterate over every vertex.", "Start a new DFS only when a vertex is not yet visited."],
    solution: `function countComponents(graph) {
  const visited = new Set();
  let count = 0;

  function visit(vertex) {
    visited.add(vertex);
    for (const { vertex: neighbor } of graph.getNeighbors(vertex)) {
      if (!visited.has(neighbor)) visit(neighbor);
    }
  }

  for (const vertex of graph.vertices) {
    if (!visited.has(vertex)) {
      count += 1;
      visit(vertex);
    }
  }

  return count;
}`,
    explanation: "Each DFS started from an undiscovered vertex covers exactly one component. The outer loop ensures isolated and disconnected vertices are included.",
    complexity: "Time: O(V + E) · Space: O(V)",
  },
];

export const cycleDetectionCode = {
  title: "Graph cycle detection",
  summary: "Undirected graphs require parent tracking; directed graphs use DFS colors to detect edges into the active recursion path.",
  undirectedCode: `function hasUndirectedCycle(graph) {
  const visited = new Set();
  const parent = new Map();

  function visit(vertex, from) {
    visited.add(vertex);
    for (const { vertex: neighbor } of graph.getNeighbors(vertex)) {
      if (neighbor === vertex) return [vertex, vertex];
      if (neighbor === from) continue;
      if (visited.has(neighbor)) {
        return reconstructCycle(vertex, neighbor, parent);
      }

      parent.set(neighbor, vertex);
      const cycle = visit(neighbor, vertex);
      if (cycle) return cycle;
    }
    return null;
  }

  for (const vertex of graph.vertices) {
    if (!visited.has(vertex)) {
      parent.set(vertex, null);
      const cycle = visit(vertex, null);
      if (cycle) return cycle;
    }
  }
  return null;
}`,
  directedCode: `function hasDirectedCycle(graph) {
  const state = new Map(); // 0: white, 1: gray, 2: black
  const path = [];
  const pathIndex = new Map();

  function visit(vertex) {
    state.set(vertex, 1);
    pathIndex.set(vertex, path.length);
    path.push(vertex);

    for (const { vertex: neighbor } of graph.getNeighbors(vertex)) {
      if ((state.get(neighbor) ?? 0) === 1) {
        return [...path.slice(pathIndex.get(neighbor)), neighbor];
      }
      if ((state.get(neighbor) ?? 0) === 0) {
        const cycle = visit(neighbor);
        if (cycle) return cycle;
      }
    }

    path.pop();
    pathIndex.delete(vertex);
    state.set(vertex, 2);
    return null;
  }

  for (const vertex of graph.vertices) {
    if ((state.get(vertex) ?? 0) === 0) {
      const cycle = visit(vertex);
      if (cycle) return cycle;
    }
  }
  return null;
}`,
  undirectedExplanation: "For each undirected edge, skip the parent edge. Reaching another visited vertex (or a self-loop) closes a cycle; parent links reconstruct its path.",
  directedExplanation: "White vertices are unvisited, gray vertices are on the current recursion path, and black vertices are complete. An edge to gray is a back edge and reconstructs a directed cycle.",
};

export const cycleDetectionComplexity = [
  {
    title: "Adjacency list",
    description: "DFS visits each vertex and examines each edge at most a constant number of times, taking O(V + E) time and O(V) auxiliary space.",
  },
  {
    title: "Adjacency matrix",
    description: "Each visited vertex requires scanning its full row for neighbors, so the traversal takes O(V²) time.",
  },
  {
    title: "Undirected parent tracking",
    description: "A visited neighbor indicates a cycle only when it is not the current vertex's parent. Self-loops are cycles immediately.",
  },
  {
    title: "Directed three-color DFS",
    description: "A back edge to a gray (currently visiting) vertex is a directed cycle; edges to black (finished) vertices are not by themselves cycles.",
  },
];

export const cycleDetectionPracticeSets = [
  {
    title: "Detect a cycle in an undirected network",
    difficulty: "Easy",
    statement: "Return whether an undirected graph contains a cycle, accounting for disconnected components and self-loops.",
    exampleInput: "Vertices A, B, C; edges A-B, B-C, C-A",
    exampleOutput: "true",
    hints: ["Run DFS from each unvisited vertex.", "Ignore the edge back to the current vertex's parent."],
    solution: cycleDetectionCode.undirectedCode,
    explanation: "Parent tracking distinguishes the ordinary reverse view of a tree edge from a genuine non-parent connection that closes a cycle.",
    complexity: "Time: O(V + E) · Space: O(V)",
  },
  {
    title: "Return a directed cycle",
    difficulty: "Medium",
    statement: "Find a directed cycle and return its vertices in edge order, repeating the first vertex at the end.",
    exampleInput: "Edges A→B, B→C, C→A",
    exampleOutput: "A → B → C → A",
    hints: ["Keep the active DFS path.", "A back edge to a gray vertex closes a cycle."],
    solution: cycleDetectionCode.directedCode,
    explanation: "Three-color DFS identifies a back edge to an ancestor and slices the active path to return the actual directed cycle.",
    complexity: "Time: O(V + E) · Space: O(V)",
  },
];

export const topologicalSortCode = {
  summary: "A topological sort is defined for directed acyclic graphs. Kahn's algorithm removes zero-in-degree vertices; DFS reverses the order in which vertices finish.",
  kahnCode: `function kahnTopologicalSort(graph) {
  const inDegree = new Map(graph.vertices.map((vertex) => [vertex, 0]));
  for (const vertex of graph.vertices) {
    for (const { vertex: neighbor } of graph.getNeighbors(vertex)) {
      inDegree.set(neighbor, inDegree.get(neighbor) + 1);
    }
  }

  const queue = graph.vertices.filter((vertex) => inDegree.get(vertex) === 0);
  const order = [];

  while (queue.length) {
    const vertex = queue.shift();
    order.push(vertex);
    for (const { vertex: neighbor } of graph.getNeighbors(vertex)) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) queue.push(neighbor);
    }
  }

  return order.length === graph.vertices.length ? order : null;
}`,
  dfsCode: `function dfsTopologicalSort(graph) {
  const state = new Map();
  const finishOrder = [];

  function visit(vertex) {
    state.set(vertex, 1);
    for (const { vertex: neighbor } of graph.getNeighbors(vertex)) {
      if (state.get(neighbor) === 1) return false;
      if (!state.has(neighbor) && !visit(neighbor)) return false;
    }
    state.set(vertex, 2);
    finishOrder.push(vertex);
    return true;
  }

  for (const vertex of graph.vertices) {
    if (!state.has(vertex) && !visit(vertex)) return null;
  }
  return finishOrder.reverse();
}`,
  kahnExplanation: "Each removed zero-in-degree vertex has no remaining prerequisites. If fewer than V vertices can be removed, a directed cycle remains and no valid ordering exists.",
  dfsExplanation: "A vertex is appended only after all outgoing neighbors finish. Reversing this finish order places each source before its descendants; a back edge to a visiting vertex signals a cycle.",
};

export const topologicalSortComplexity = [
  {
    title: "Kahn's algorithm",
    description: "Computing in-degrees and processing each vertex and edge once takes O(V + E) time. The queue and in-degree map use O(V) auxiliary space.",
  },
  {
    title: "DFS-based ordering",
    description: "Three-color DFS inspects each vertex and edge once for O(V + E) time. The recursion path and finish order require O(V) auxiliary space.",
  },
  {
    title: "DAG requirement",
    description: "A topological order exists only for a directed acyclic graph. If cycle detection fails, no partial order is treated as a valid result.",
  },
  {
    title: "Multiple valid orders",
    description: "Independent vertices may be scheduled in different orders. Any sequence that places every edge's source before its destination is valid.",
  },
];

export const topologicalSortPracticeSets = [
  {
    title: "Schedule project tasks",
    difficulty: "Easy",
    statement: "Return a valid task order for a directed acyclic dependency graph, or report that the dependencies contain a cycle.",
    exampleInput: "Plan→Code, Plan→Docs, Code→Test",
    exampleOutput: "Plan, Code, Docs, Test (one valid ordering)",
    hints: ["Calculate each task's number of prerequisites.", "Place a task in the queue when its in-degree reaches zero."],
    solution: topologicalSortCode.kahnCode,
    explanation: "Kahn's algorithm schedules only tasks whose prerequisites are already removed. A cycle prevents all tasks from reaching zero in-degree.",
    complexity: "Time: O(V + E) · Space: O(V)",
  },
  {
    title: "Detect impossible course prerequisites",
    difficulty: "Medium",
    statement: "Given directed prerequisite relationships, determine whether all courses can be completed and produce a valid order when possible.",
    exampleInput: "A→B, B→C, C→A",
    exampleOutput: "No valid ordering — directed cycle",
    hints: ["A back edge to a gray vertex indicates a cycle.", "Return no ordering instead of a partial order if a cycle is found."],
    solution: topologicalSortCode.dfsCode,
    explanation: "DFS finishing order produces an ordering only when no active-path back edge occurs; that cycle would make the prerequisite constraints contradictory.",
    complexity: "Time: O(V + E) · Space: O(V)",
  },
];

export const dijkstraCode = {
  summary: "Dijkstra finalizes the currently closest vertex, then relaxes outgoing edges using a min-priority queue. Edge weights must be non-negative.",
  code: `function dijkstra(graph, source) {
  const distances = Object.fromEntries(
    graph.vertices.map((vertex) => [String(vertex), Infinity])
  );
  const parents = Object.fromEntries(
    graph.vertices.map((vertex) => [String(vertex), null])
  );
  const finalized = new Set();
  const queue = new MinPriorityQueue();
  distances[String(source)] = 0;
  queue.push({ vertex: source, distance: 0 });

  while (queue.size) {
    const { vertex, distance } = queue.pop();
    const current = String(vertex);
    if (distance !== distances[current] || finalized.has(current)) continue;
    finalized.add(current);

    for (const { vertex: neighbor, weight } of graph.getNeighbors(vertex)) {
      const next = String(neighbor);
      const candidate = distance + weight;
      if (candidate < distances[next]) {
        distances[next] = candidate;
        parents[next] = current;
        queue.push({ vertex: neighbor, distance: candidate });
      }
    }
  }
  return { distances, parents, finalized };
}`,
  explanation: "The min-priority queue selects the smallest tentative distance. Relaxation improves a neighbor's distance and parent when a shorter route is found. Negative weights are rejected because a finalized distance could later decrease.",
};

export const dijkstraComplexity = [
  {
    title: "Binary min-heap",
    description: "With a binary min-heap and lazy duplicate entries, each edge can produce a queue insertion, giving O((V + E) log V) time and O(V + E) worst-case queue entries.",
  },
  {
    title: "Space",
    description: "Distance, parent, and finalized state use O(V) space; the priority queue uses O(E) in the lazy-duplicate implementation.",
  },
  {
    title: "Weight constraint",
    description: "All edge weights must be finite and non-negative. Negative weights are explicitly rejected; use Bellman–Ford when negative edges are required.",
  },
  {
    title: "Unreachable vertices",
    description: "Vertices not reached from the source retain distance Infinity and have no reconstructed path.",
  },
];

export const dijkstraPracticeSets = [
  {
    title: "Cheapest route from a source",
    difficulty: "Easy",
    statement: "Compute the shortest distance and parent links from one source in a non-negative weighted graph.",
    exampleInput: "A→B (4), A→C (2), C→B (1), source A",
    exampleOutput: "distances: A=0, B=3, C=2",
    hints: ["Always process the smallest tentative distance.", "Relax each outgoing edge and update its parent when the route improves."],
    solution: dijkstraCode.code,
    explanation: "The priority queue always chooses the vertex whose best possible route is currently smallest. With non-negative edges, that distance can be finalized safely.",
    complexity: "Time: O((V + E) log V) · Space: O(V + E)",
  },
  {
    title: "Reconstruct a shortest route",
    difficulty: "Medium",
    statement: "Use the parent map produced by Dijkstra to reconstruct a route from the source to a reachable target.",
    exampleInput: "Parents: T←B, B←A, A←S; target T",
    exampleOutput: "S → A → B → T",
    hints: ["Start at the target and follow parent links backward.", "Reverse the collected sequence; return no path for an infinite-distance target."],
    solution: `function reconstructPath(parents, source, target) {
  const path = [];
  let current = target;
  while (current !== null && current !== undefined) {
    path.push(current);
    current = parents[current];
  }
  path.reverse();
  return path[0] === source ? path : [];
}`,
    explanation: "Each successful relaxation records the preceding vertex. Following those parents from target to source gives the shortest path tree route.",
    complexity: "Time: O(path length) · Space: O(path length)",
  },
];

export const bellmanFordCode = {
  summary: "Bellman–Ford relaxes every edge V−1 times, stops early if a pass has no changes, and performs one additional pass to detect source-reachable negative cycles.",
  code: `function bellmanFord(graph, source) {
  const distance = Object.fromEntries(
    graph.vertices.map((vertex) => [String(vertex), Infinity])
  );
  const parent = Object.fromEntries(
    graph.vertices.map((vertex) => [String(vertex), null])
  );
  distance[String(source)] = 0;
  const edges = graph.vertices.flatMap((from) =>
    graph.getNeighbors(from).map(({ vertex: to, weight }) => ({ from, to, weight }))
  );

  for (let pass = 1; pass < graph.vertices.length; pass += 1) {
    let changed = false;
    for (const { from, to, weight } of edges) {
      if (distance[String(from)] !== Infinity
        && distance[String(from)] + weight < distance[String(to)]) {
        distance[String(to)] = distance[String(from)] + weight;
        parent[String(to)] = String(from);
        changed = true;
      }
    }
    if (!changed) break;
  }

  const hasReachableNegativeCycle = edges.some(({ from, to, weight }) =>
    distance[String(from)] !== Infinity
    && distance[String(from)] + weight < distance[String(to)]
  );
  return { distance, parent, hasReachableNegativeCycle };
}`,
  explanation: "Only edges reachable from a finite-distance source can relax. An improvement after V−1 passes proves a reachable negative cycle; affected downstream distances are undefined.",
};

export const bellmanFordComplexity = [
  {
    title: "Time complexity",
    description: "At most V−1 passes inspect E edges, followed by one cycle-check pass: O(VE) time. Early termination can reduce work on graphs that settle quickly.",
  },
  {
    title: "Auxiliary space",
    description: "Distances, parents, and cycle-affected state take O(V) space, excluding the graph representation and recorded teaching snapshots.",
  },
  {
    title: "Reachable negative cycles",
    description: "An additional relaxation pass detects cycles reachable from the source. Their downstream vertices have undefined shortest distances, represented as −∞ (undefined).",
  },
  {
    title: "Unreachable negative cycles",
    description: "Edges from vertices at infinity are not relaxed, so negative cycles outside the source-reachable region do not invalidate the source's finite shortest paths.",
  },
];

export const bellmanFordPracticeSets = [
  {
    title: "Shortest paths with negative edges",
    difficulty: "Easy",
    statement: "Compute shortest distances from a source when some edge weights are negative but the reachable graph has no negative cycle.",
    exampleInput: "A→B (4), A→C (5), C→B (-2), source A",
    exampleOutput: "A=0, C=5, B=3",
    hints: ["Repeat full edge relaxations V−1 times.", "Skip edges whose source distance is Infinity."],
    solution: bellmanFordCode.code,
    explanation: "Repeated relaxation progressively considers paths with more edges and supports negative edge weights without relying on a greedy finalization.",
    complexity: "Time: O(VE) · Space: O(V)",
  },
  {
    title: "Identify vertices affected by a negative cycle",
    difficulty: "Medium",
    statement: "After the V−1 passes, identify a reachable negative cycle and all vertices whose distances are undefined because they are reachable from it.",
    exampleInput: "S→A (1), A→B (-3), B→A (1), B→T (2)",
    exampleOutput: "Reachable negative cycle; A, B, and T have undefined shortest distance",
    hints: ["Look for any further improvement on an edge whose source is reachable.", "Propagate from changed vertices through outgoing edges."],
    solution: `function markAffected(graph, changedVertices) {
  const affected = new Set();
  const queue = [...changedVertices];
  for (const vertex of queue) {
    if (affected.has(vertex)) continue;
    affected.add(vertex);
    for (const { vertex: neighbor } of graph.getNeighbors(vertex)) {
      queue.push(neighbor);
    }
  }
  return affected;
}`,
    explanation: "A negative cycle can be traversed arbitrarily many times, so it and every downstream vertex have no finite minimum path cost. Unreachable cycles are excluded by finite-distance checks.",
    complexity: "Time: O(V + E) after cycle detection · Space: O(V)",
  },
];

export const floydWarshallCode = {
  summary: "Floyd–Warshall maintains a distance matrix. For each intermediate vertex k, it compares each pair's current distance with the route through k.",
  code: `function floydWarshall(graph) {
  const vertices = graph.vertices;
  const n = vertices.length;
  const distance = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity))
  );
  const next = Array.from({ length: n }, () => Array(n).fill(null));

  vertices.forEach((from, i) => {
    for (const { vertex: to, weight } of graph.getNeighbors(from)) {
      const j = vertices.indexOf(to);
      if (weight < distance[i][j]) {
        distance[i][j] = weight;
        next[i][j] = j;
      }
    }
  });

  for (let k = 0; k < n; k += 1) {
    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n; j += 1) {
        const throughK = distance[i][k] + distance[k][j];
        if (throughK < distance[i][j]) {
          distance[i][j] = throughK;
          next[i][j] = next[i][k];
        }
      }
    }
  }

  const negativeCycles = vertices.filter((_, i) => distance[i][i] < 0);
  return { distance, next, negativeCycles };
}`,
  explanation: "The recurrence d[i][j] = min(d[i][j], d[i][k] + d[k][j]) allows each vertex as an intermediate. A negative diagonal reveals a negative cycle; paths through that cycle have undefined costs.",
};

export const floydWarshallComplexity = [
  {
    title: "Time complexity",
    description: "Three nested loops over vertices take O(V³) time.",
  },
  {
    title: "Space complexity",
    description: "The distance and next-hop matrices each use O(V²) space. Teaching snapshots copy these matrices so playback steps remain independent.",
  },
  {
    title: "Negative edges and cycles",
    description: "Negative edges are supported. Any negative diagonal after the iterations identifies a negative cycle; source-destination pairs that can reach and leave it have undefined shortest distances.",
  },
  {
    title: "Best fit",
    description: "Floyd–Warshall computes all pairs and is straightforward for dense or small graphs. For a single source, Dijkstra or Bellman–Ford usually does less work.",
  },
];

export const floydWarshallPracticeSets = [
  {
    title: "All-pairs route table",
    difficulty: "Easy",
    statement: "Build the shortest-distance matrix for a weighted graph and update it using each vertex as an intermediate.",
    exampleInput: "A→B (3), B→C (-2), A→C (10)",
    exampleOutput: "A→C = 1",
    hints: ["Initialize direct edges and zero diagonal entries.", "Compare the current i→j route with i→k→j."],
    solution: floydWarshallCode.code,
    explanation: "The dynamic-programming recurrence gradually admits more intermediate vertices while preserving the best known distance for every ordered pair.",
    complexity: "Time: O(V³) · Space: O(V²)",
  },
  {
    title: "Reconstruct an all-pairs route",
    difficulty: "Medium",
    statement: "Maintain a next-hop matrix while updating distances, then reconstruct a path between a selected pair.",
    exampleInput: "Shortest route A→B→C; next[A][C] = B",
    exampleOutput: "A → B → C",
    hints: ["When a route through k improves i→j, set next[i][j] = next[i][k].", "Follow next[current][destination] until the destination is reached."],
    solution: `function reconstructPath(next, vertices, from, to) {
  let current = vertices.indexOf(from);
  const target = vertices.indexOf(to);
  if (current < 0 || target < 0 || next[current][target] === null) return [];
  const path = [vertices[current]];
  while (current !== target) {
    current = next[current][target];
    if (current === null) return [];
    path.push(vertices[current]);
  }
  return path;
}`,
    explanation: "Each next-hop entry stores the first step of the current best route. A bounded walk reconstructs the path, while unreachable or cycle-affected pairs have no defined finite route.",
    complexity: "Time: O(path length) · Space: O(path length)",
  },
];

export const mstCode = {
  summary: "Prim grows a forest by adding the lightest crossing edge. Kruskal sorts all edges and uses Union-Find to accept only edges joining separate components.",
  primCode: `function prim(graph, start) {
  const visited = new Set([start]);
  const selected = [];
  const candidates = new MinPriorityQueue();
  let totalWeight = 0;

  function addFrontier(vertex) {
    for (const { vertex: neighbor, weight } of graph.getNeighbors(vertex)) {
      if (!visited.has(neighbor)) {
        candidates.push({ from: vertex, to: neighbor, weight });
      }
    }
  }

  addFrontier(start);
  while (candidates.size) {
    const edge = candidates.pop();
    if (visited.has(edge.from) === visited.has(edge.to)) continue;
    const next = visited.has(edge.from) ? edge.to : edge.from;
    visited.add(next);
    selected.push(edge);
    totalWeight += edge.weight;
    addFrontier(next);
  }
  return { selected, totalWeight };
}`,
  kruskalCode: `function kruskal(graph) {
  const edges = graph.edgeList().sort((a, b) => a.weight - b.weight);
  const sets = new UnionFind(graph.vertices);
  const selected = [];
  const rejected = [];
  let totalWeight = 0;

  for (const edge of edges) {
    if (sets.union(edge.from, edge.to)) {
      selected.push(edge);
      totalWeight += edge.weight;
    } else {
      rejected.push(edge);
    }
  }
  return { selected, rejected, totalWeight };
}`,
  primExplanation: "The frontier priority queue contains edges leaving the current tree. Accepting the lightest edge that reaches an unvisited vertex preserves a minimum tree; restart for each disconnected component.",
  kruskalExplanation: "Sort edges globally by weight. Union-Find accepts an edge only when its endpoints belong to different components, so selected edges never form a cycle.",
};

export const mstComplexity = [
  {
    title: "Prim with a binary heap",
    description: "A binary heap frontier gives O((V + E) log V) time. For disconnected input, repeat the growth process once per component to build a minimum spanning forest.",
  },
  {
    title: "Kruskal",
    description: "Sorting E edges dominates at O(E log E). Union-Find operations with path compression and union by rank are near O(1) amortized per edge.",
  },
  {
    title: "Auxiliary space",
    description: "Prim stores visited vertices and frontier edges; Kruskal stores sorted edges and Union-Find parents/ranks. Both use O(V + E) auxiliary space.",
  },
  {
    title: "Negative and zero weights",
    description: "MST algorithms compare edge weights rather than relying on shortest-path assumptions, so negative and zero weights are valid. Directed graphs are rejected.",
  },
];

export const mstPracticeSets = [
  {
    title: "Connect locations at minimum cost",
    difficulty: "Easy",
    statement: "Choose edges that connect all locations with the smallest total construction cost and no cycles.",
    exampleInput: "A—B (4), A—C (2), B—C (1), B—D (5)",
    exampleOutput: "A—C, B—C, B—D; total weight 8",
    hints: ["Grow from a chosen vertex or sort all edges.", "Never accept an edge that creates a cycle."],
    solution: mstCode.primCode,
    explanation: "Prim grows one component with the cheapest frontier edge at each step. For a disconnected network, restart from a remaining vertex and report a forest.",
    complexity: "Time: O((V + E) log V) · Space: O(V + E)",
  },
  {
    title: "Build a minimum spanning forest",
    difficulty: "Medium",
    statement: "For a disconnected weighted undirected graph, find one minimum spanning tree for each component.",
    exampleInput: "A—B (2), C—D (1), E isolated",
    exampleOutput: "Forest edges A—B and C—D; 3 components",
    hints: ["Use a disjoint set for components.", "Include isolated vertices even though they contribute no edges."],
    solution: mstCode.kruskalCode,
    explanation: "Kruskal naturally produces a forest when the graph is disconnected. Every selected edge merges two components; isolated vertices remain singleton components.",
    complexity: "Time: O(E log E) · Space: O(V + E)",
  },
];

export const disjointSetLearning = {
  introduction: "Disjoint Set Union (DSU), also called Union-Find, maintains a collection of non-overlapping components. It quickly answers whether two elements share a component and merges components when needed.",
  applications: "DSU is useful for Kruskal's minimum spanning tree algorithm, dynamic connectivity queries, grouping equivalent items, detecting cycles while adding undirected edges, and image or network component labeling.",
  pathCompression: "Find follows parent links to the representative, then rewires each visited element directly to that root. Future finds on the same path are shorter.",
  unionBySize: "Union compares component sizes and attaches the smaller root below the larger root. This keeps trees shallow; ties may be resolved consistently in favor of the first root.",
  comparison: "A graph traversal can discover connected vertices in O(V + E) time per query. DSU is especially efficient when edges are added incrementally: connectivity and merge operations are near-constant amortized time, but DSU does not support arbitrary edge removals or return a full graph path.",
  pseudocode: `MAKE-SET(x):
  parent[x] = x
  size[x] = 1

FIND(x):
  if parent[x] != x:
    parent[x] = FIND(parent[x])
  return parent[x]

UNION(a, b):
  rootA = FIND(a)
  rootB = FIND(b)
  if rootA == rootB: return false
  attach the smaller root below the larger root
  update the new root's component size
  return true`,
  implementation: `class DisjointSet {
  constructor(elements) {
    this.parent = new Map();
    this.size = new Map();
    for (const element of elements) {
      if (this.parent.has(element)) continue;
      this.parent.set(element, element);
      this.size.set(element, 1);
    }
  }

  find(element) {
    if (!this.parent.has(element)) throw new Error("Unknown element");
    const parent = this.parent.get(element);
    if (parent !== element) this.parent.set(element, this.find(parent));
    return this.parent.get(element);
  }

  union(left, right) {
    let leftRoot = this.find(left);
    let rightRoot = this.find(right);
    if (leftRoot === rightRoot) return false;
    if (this.size.get(leftRoot) < this.size.get(rightRoot)) {
      [leftRoot, rightRoot] = [rightRoot, leftRoot];
    }
    this.parent.set(rightRoot, leftRoot);
    this.size.set(leftRoot, this.size.get(leftRoot) + this.size.get(rightRoot));
    this.size.delete(rightRoot);
    return true;
  }
}`,
};

export const disjointSetComplexity = [
  {
    title: "Find and union",
    description: "With path compression and union by size, operations take O(α(n)) amortized time, where α is the inverse Ackermann function and grows so slowly that it is at most a tiny constant for practical input sizes.",
  },
  {
    title: "Initialization",
    description: "Creating n singleton sets takes O(n) time and O(n) space.",
  },
  {
    title: "Component queries",
    description: "Connected checks use two finds and remain O(α(n)) amortized. Component count is O(1); grouping all elements traverses their parent chains and takes O(n log n) before path compression, with union by size.",
  },
  {
    title: "Limitation",
    description: "The structure supports component merges, not arbitrary edge deletions. Use graph traversal or a more specialized dynamic-connectivity structure when components must split.",
  },
];

export const disjointSetPracticeSets = [
  {
    title: "Connect components",
    difficulty: "Easy",
    statement: "Process pairs that become connected and report how many components remain after each merge.",
    exampleInput: "5 elements; union(1, 2), union(2, 3)",
    exampleOutput: "3 components; {1, 2, 3}, {4}, {5}",
    hints: ["Initialize each element as its own parent.", "Decrease the component count only when the roots differ."],
    solution: `const sets = new DisjointSet([1, 2, 3, 4, 5]);
sets.union(1, 2);
sets.union(2, 3);
console.log(sets.getComponents());
console.log(sets.getComponentCount());`,
    explanation: "Each successful union merges two existing components. A repeated union on an already-connected pair leaves the count unchanged.",
    complexity: "Time: O(α(n)) amortized per union · Space: O(n)",
  },
  {
    title: "Detect a cycle while adding edges",
    difficulty: "Medium",
    statement: "For each undirected edge, decide whether adding it connects two vertices already in the same component.",
    exampleInput: "Edges: A—B, B—C, A—C",
    exampleOutput: "A—C closes a cycle",
    hints: ["Check connectivity before applying the edge.", "If both endpoints have the same representative, the edge closes a cycle."],
    solution: `function addsCycle(sets, from, to) {
  if (sets.connected(from, to)) return true;
  sets.union(from, to);
  return false;
}`,
    explanation: "Union-Find detects the first edge joining vertices already connected by earlier edges. This is the same idea used by Kruskal's algorithm to skip cycle-forming edges.",
    complexity: "Time: O(α(n)) amortized per edge · Space: O(n)",
  },
];

export const sccLearning = {
  introduction: "A strongly connected component (SCC) is a maximal set of vertices in a directed graph where every vertex can reach every other vertex. A vertex with no mutual reachability beyond itself forms a singleton SCC.",
  directedGraphs: "Direction matters: A → B does not imply B → A. SCC algorithms partition directed graphs by mutual reachability, including isolated vertices and singleton self-loops.",
  kosarajuExplanation: "Kosaraju performs DFS on the original graph and records vertices by finishing time. It reverses every edge, then explores in decreasing finishing order; each second-pass DFS yields one SCC.",
  tarjanExplanation: "Tarjan runs one DFS. Discovery indices and low-link values summarize how far a DFS subtree can reach while remaining on the active stack. When low[u] equals discovery[u], u is an SCC root and vertices are popped through u.",
  kosarajuCode: `function kosaraju(graph) {
  const visited = new Set();
  const finishOrder = [];

  function finish(vertex) {
    visited.add(vertex);
    for (const { vertex: next } of graph.getNeighbors(vertex)) {
      if (!visited.has(next)) finish(next);
    }
    finishOrder.push(vertex);
  }
  for (const vertex of graph.vertices) {
    if (!visited.has(vertex)) finish(vertex);
  }

  const reversed = reverseEdges(graph);
  visited.clear();
  const components = [];
  function collect(vertex, component) {
    visited.add(vertex);
    component.push(vertex);
    for (const next of reversed.get(vertex)) {
      if (!visited.has(next)) collect(next, component);
    }
  }
  for (const vertex of finishOrder.reverse()) {
    if (visited.has(vertex)) continue;
    const component = [];
    collect(vertex, component);
    components.push(component);
  }
  return components;
}`,
  tarjanCode: `function tarjan(graph) {
  let time = 0;
  const discovery = new Map();
  const low = new Map();
  const stack = [];
  const onStack = new Set();
  const components = [];

  function visit(vertex) {
    discovery.set(vertex, time);
    low.set(vertex, time++);
    stack.push(vertex);
    onStack.add(vertex);
    for (const { vertex: next } of graph.getNeighbors(vertex)) {
      if (!discovery.has(next)) {
        visit(next);
        low.set(vertex, Math.min(low.get(vertex), low.get(next)));
      } else if (onStack.has(next)) {
        low.set(vertex, Math.min(low.get(vertex), discovery.get(next)));
      }
    }
    if (low.get(vertex) === discovery.get(vertex)) {
      const component = [];
      let member;
      do {
        member = stack.pop();
        onStack.delete(member);
        component.push(member);
      } while (member !== vertex);
      components.push(component);
    }
  }
  for (const vertex of graph.vertices) {
    if (!discovery.has(vertex)) visit(vertex);
  }
  return components;
}`,
};

export const sccComplexity = [
  {
    title: "Kosaraju",
    description: "Two depth-first passes and one reversed adjacency representation take O(V + E) time and O(V + E) auxiliary space.",
  },
  {
    title: "Tarjan",
    description: "A single depth-first pass with discovery, low-link, and active-stack state takes O(V + E) time and O(V) auxiliary space, excluding the input graph.",
  },
  {
    title: "When to use each",
    description: "Both find the same partition in linear time. Kosaraju's two passes are intuitive and expose a useful finishing-order/reversal visualization; Tarjan uses one pass and avoids building the reversed graph.",
  },
  {
    title: "Applications",
    description: "SCCs identify mutually reachable pages in link graphs, dependency cycles, communication groups, compiler control-flow regions, and strongly connected regions in directed networks.",
  },
];

export const sccPracticeSets = [
  {
    title: "Partition a directed network",
    difficulty: "Easy",
    statement: "Group vertices that can each reach every other vertex in the same group.",
    exampleInput: "A→B, B→A, B→C, C→D, D→C",
    exampleOutput: "{A, B} and {C, D}",
    hints: ["Reachability must work in both directions within an SCC.", "Edges between SCCs do not merge them unless a return path exists."],
    solution: sccLearning.kosarajuCode,
    explanation: "The cross-edge from the first SCC to the second has no return path, so the two strongly connected regions stay separate.",
    complexity: "Time: O(V + E) · Space: O(V + E)",
  },
  {
    title: "Compare Tarjan and Kosaraju",
    difficulty: "Medium",
    statement: "Find SCCs with both algorithms and verify that the partitions match even if components are listed in a different order.",
    exampleInput: "A↔B, B→C, C↔D, E isolated",
    exampleOutput: "{A, B}, {C, D}, {E}",
    hints: ["Sort members within each component before comparing.", "Do not depend on the ordering in which components are discovered."],
    solution: sccLearning.tarjanCode,
    explanation: "Tarjan extracts components at low-link roots. Kosaraju extracts them in a second DFS over the reversed graph; both give the same partition.",
    complexity: "Time: O(V + E) per algorithm · Space: O(V + E)",
  },
];

export const bridgesArticulationLearning = {
  bridgeDefinition: "A bridge (or cut edge) is an edge whose removal increases the number of connected components. In DFS, a tree edge (u, v) is a bridge exactly when low[v] > discovery[u]; no back edge from v's subtree reaches u or an ancestor.",
  articulationDefinition: "An articulation point (or cut vertex) is a vertex whose removal increases the number of connected components. It may be a non-root vertex separating a child subtree, or a DFS root with at least two DFS-tree children.",
  lowLinkExplanation: "low[v] is the smallest discovery time reachable from v's DFS subtree using zero or more tree edges followed by at most one back edge. The exact parent tree edge is skipped; a different edge to the parent would be a back edge if parallel edges were supported.",
  rootCondition: "A DFS root is an articulation point only when it has more than one DFS-tree child. With one child, removing the root cannot split that single DFS tree into multiple remaining branches.",
  nonRootCondition: "A non-root u is an articulation point if some DFS child v has low[v] >= discovery[u]. A strict greater-than test is used for bridges because a back edge reaching u keeps the child subtree connected if the tree edge is removed.",
  bridgeCode: `function findBridges(graph) {
  let time = 0;
  const discovery = new Map();
  const low = new Map();
  const bridges = [];

  function dfs(vertex, parent, parentEdge) {
    discovery.set(vertex, time);
    low.set(vertex, time++);
    for (const edge of graph.getNeighbors(vertex)) {
      if (edge.id === parentEdge) continue;
      if (!discovery.has(edge.vertex)) {
        dfs(edge.vertex, vertex, edge.id);
        low.set(vertex, Math.min(low.get(vertex), low.get(edge.vertex)));
        if (low.get(edge.vertex) > discovery.get(vertex)) {
          bridges.push([vertex, edge.vertex]);
        }
      } else {
        low.set(vertex, Math.min(low.get(vertex), discovery.get(edge.vertex)));
      }
    }
  }
  for (const vertex of graph.vertices) {
    if (!discovery.has(vertex)) dfs(vertex, null, null);
  }
  return bridges;
}`,
  articulationCode: `function findArticulationPoints(graph) {
  let time = 0;
  const discovery = new Map();
  const low = new Map();
  const points = new Set();

  function dfs(vertex, parent, parentEdge) {
    discovery.set(vertex, time);
    low.set(vertex, time++);
    let childCount = 0;
    for (const edge of graph.getNeighbors(vertex)) {
      if (edge.id === parentEdge) continue;
      if (!discovery.has(edge.vertex)) {
        childCount++;
        dfs(edge.vertex, vertex, edge.id);
        low.set(vertex, Math.min(low.get(vertex), low.get(edge.vertex)));
        if (parent !== null && low.get(edge.vertex) >= discovery.get(vertex)) {
          points.add(vertex);
        }
      } else {
        low.set(vertex, Math.min(low.get(vertex), discovery.get(edge.vertex)));
      }
    }
    if (parent === null && childCount > 1) points.add(vertex);
  }
  for (const vertex of graph.vertices) {
    if (!discovery.has(vertex)) dfs(vertex, null, null);
  }
  return [...points];
}`,
  comparison: "A bridge is a critical connection: removing one edge splits a connected component. An articulation point is a critical vertex: removing it (and its incident edges) splits a component. They are related but neither is a one-to-one substitute for the other; a cycle has neither, while a path has both.",
  applications: "Bridge and articulation analysis helps find single points of failure in communication networks, transportation routes, power grids, dependency networks, and infrastructure planning.",
  pseudocode: `DFS(u, parentEdge):
  discovery[u] = low[u] = nextTime()
  childCount = 0
  for each incident edge e = (u, v):
    if e is the exact parent edge: continue
    if v is unvisited:
      childCount++
      DFS(v, e)
      low[u] = min(low[u], low[v])
      if low[v] > discovery[u]: e is a bridge
      if parent[u] exists and low[v] >= discovery[u]:
        u is an articulation point
    else:
      low[u] = min(low[u], discovery[v])
  if u is a DFS root and childCount > 1:
    u is an articulation point`,
};

export const bridgesArticulationComplexity = [
  {
    title: "Time complexity",
    description: "A single DFS processes each vertex and undirected edge a constant number of times: O(V + E). The DFS restarts at every unvisited vertex to handle disconnected graphs.",
  },
  {
    title: "Auxiliary space",
    description: "Discovery, low-link, parent, visited, and recursion-stack state use O(V) auxiliary space, excluding the graph and reported results.",
  },
  {
    title: "Bridge condition",
    description: "For DFS tree edge u—v, low[v] > discovery[u] means the child subtree cannot reach u or an ancestor without that edge, so u—v is a bridge.",
  },
  {
    title: "Articulation conditions",
    description: "A non-root u is critical when a child v has low[v] >= discovery[u]. A root is critical only when it has more than one DFS-tree child.",
  },
];

export const bridgesArticulationPracticeSets = [
  {
    title: "Find critical connections",
    difficulty: "Easy",
    statement: "Report edges whose removal disconnects the network.",
    exampleInput: "A—B, B—C, C—A, C—D",
    exampleOutput: "C—D",
    hints: ["Track the earliest discovery reachable from each DFS subtree.", "Use the strict bridge condition low[child] > discovery[parent]."],
    solution: bridgesArticulationLearning.bridgeCode,
    explanation: "The triangle lets A, B, and C reach one another without using any single triangle edge. C—D has no alternate route, so it is a bridge.",
    complexity: "Time: O(V + E) · Space: O(V)",
  },
  {
    title: "Find cut vertices",
    difficulty: "Medium",
    statement: "Find vertices whose removal disconnects the graph, remembering the special DFS-root rule.",
    exampleInput: "A—B, A—C, C—D",
    exampleOutput: "A and C",
    hints: ["A root needs at least two DFS-tree children.", "For a non-root u, check whether any child v has low[v] >= discovery[u]."],
    solution: bridgesArticulationLearning.articulationCode,
    explanation: "Removing A separates B and the C—D branch. Removing C separates D. A is a DFS root with two children; C satisfies the non-root low-link condition.",
    complexity: "Time: O(V + E) · Space: O(V)",
  },
];
