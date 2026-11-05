import { BinaryTree, TreeNode } from "./binaryTrees.js";

export class BinarySearchTree extends BinaryTree {
  constructor(initialValues = [], duplicatePolicy = "right") {
    super();
    this.duplicatePolicy = duplicatePolicy;
    initialValues.forEach((value) => this.insert(value));
  }

  insert(value) {
    const node = new TreeNode(value);

    if (!this.root) {
      this.root = node;
      this.size = 1;
      return node;
    }

    let current = this.root;
    while (current) {
      if (value === current.value) {
        if (this.duplicatePolicy === "left") {
          if (!current.left) {
            current.left = node;
            this.size += 1;
            return node;
          }
          current = current.left;
          continue;
        }

        if (!current.right) {
          current.right = node;
          this.size += 1;
          return node;
        }
        current = current.right;
        continue;
      }

      if (value < current.value) {
        if (!current.left) {
          current.left = node;
          this.size += 1;
          return node;
        }
        current = current.left;
      } else if (value > current.value) {
        if (!current.right) {
          current.right = node;
          this.size += 1;
          return node;
        }
        current = current.right;
      }
    }

    return node;
  }

  insertWithAnimation(value) {
    const steps = [];
    const makeStep = (label, visited = [], changed = []) => {
      steps.push({
        label,
        explanation: label,
        visited: [...visited],
        changed: [...changed],
        tree: this.toSnapshot(),
      });
    };

    if (!this.root) {
      const node = new TreeNode(value);
      this.root = node;
      this.size = 1;
      makeStep(`Insert ${value} as root`, [value], [value]);
      return steps;
    }

    let current = this.root;
    let parent = null;
    let direction = null;

    while (current) {
      makeStep(`Compare ${value} with ${current.value}`, [current.value], []);
      if (value === current.value) {
        if (this.duplicatePolicy === "left") {
          if (!current.left) {
            const node = new TreeNode(value);
            current.left = node;
            this.size += 1;
            makeStep(`Inserted duplicate ${value} to the left`, [current.value, value], [value]);
            return steps;
          }
          parent = current;
          direction = "left";
          current = current.left;
          continue;
        }

        if (!current.right) {
          const node = new TreeNode(value);
          current.right = node;
          this.size += 1;
          makeStep(`Inserted duplicate ${value} to the right`, [current.value, value], [value]);
          return steps;
        }
        parent = current;
        direction = "right";
        current = current.right;
        continue;
      }

      if (value < current.value) {
        if (!current.left) {
          const node = new TreeNode(value);
          current.left = node;
          this.size += 1;
          makeStep(`Insert ${value} to the left of ${current.value}`, [current.value, value], [value]);
          return steps;
        }
        parent = current;
        direction = "left";
        current = current.left;
      } else {
        if (!current.right) {
          const node = new TreeNode(value);
          current.right = node;
          this.size += 1;
          makeStep(`Insert ${value} to the right of ${current.value}`, [current.value, value], [value]);
          return steps;
        }
        parent = current;
        direction = "right";
        current = current.right;
      }
    }

    if (parent) {
      makeStep(`Inserted ${value} under ${parent.value} (${direction})`, [parent.value, value], [value]);
    }

    return steps;
  }

  search(value) {
    let current = this.root;
    while (current) {
      if (value === current.value) return current;
      current = value < current.value ? current.left : current.right;
    }
    return null;
  }

  searchWithAnimation(value) {
    const steps = [];
    let current = this.root;

    while (current) {
      steps.push({
        label: `Compare ${value} with ${current.value}`,
        explanation: `Checking the current node ${current.value} while searching for ${value}.`,
        visited: [current.value],
        changed: [],
        tree: this.toSnapshot(),
      });

      if (value === current.value) {
        steps.push({
          label: `Found ${value}`,
          explanation: `Value ${value} matches the current node and was found in the BST.`,
          visited: [current.value],
          changed: [current.value],
          tree: this.toSnapshot(),
        });
        return steps;
      }

      current = value < current.value ? current.left : current.right;
    }

    steps.push({
      label: `Missing ${value}`,
      explanation: `The value ${value} was not found; the search path ended at a null subtree.`,
      visited: [],
      changed: [],
      tree: this.toSnapshot(),
    });
    return steps;
  }

  findMin(node = this.root) {
    if (!node) return null;
    let current = node;
    while (current.left) {
      current = current.left;
    }
    return current;
  }

  findMax(node = this.root) {
    if (!node) return null;
    let current = node;
    while (current.right) {
      current = current.right;
    }
    return current;
  }

  findSuccessor(value) {
    const node = this.search(value);
    if (!node) return null;

    if (node.right) {
      return this.findMin(node.right);
    }

    let successor = null;
    let current = this.root;
    while (current) {
      if (value < current.value) {
        successor = current;
        current = current.left;
      } else if (value > current.value) {
        current = current.right;
      } else {
        break;
      }
    }

    return successor;
  }

  findPredecessor(value) {
    const node = this.search(value);
    if (!node) return null;

    if (node.left) {
      return this.findMax(node.left);
    }

    let predecessor = null;
    let current = this.root;
    while (current) {
      if (value < current.value) {
        current = current.left;
      } else if (value > current.value) {
        predecessor = current;
        current = current.right;
      } else {
        break;
      }
    }

    return predecessor;
  }

  findLCA(valueA, valueB) {
    let current = this.root;
    while (current) {
      if (valueA < current.value && valueB < current.value) {
        current = current.left;
      } else if (valueA > current.value && valueB > current.value) {
        current = current.right;
      } else {
        return current;
      }
    }
    return null;
  }

  findHeight(node = this.root) {
    if (!node) return -1;
    return 1 + Math.max(this.findHeight(node.left), this.findHeight(node.right));
  }

  findDepth(value, node = this.root, depth = 0) {
    if (!node) return -1;
    if (value === node.value) return depth;
    if (value < node.value) return this.findDepth(value, node.left, depth + 1);
    return this.findDepth(value, node.right, depth + 1);
  }

  validateBST(node = this.root, min = null, max = null) {
    if (!node) return true;
    if (min !== null && node.value <= min) return false;
    if (max !== null && node.value >= max) return false;
    return this.validateBST(node.left, min, node.value) && this.validateBST(node.right, node.value, max);
  }

  delete(value) {
    const removeNode = (node, target) => {
      if (!node) return null;

      if (target < node.value) {
        node.left = removeNode(node.left, target);
        return node;
      }

      if (target > node.value) {
        node.right = removeNode(node.right, target);
        return node;
      }

      if (!node.left && !node.right) {
        this.size = Math.max(this.size - 1, 0);
        return null;
      }

      if (!node.left) {
        this.size = Math.max(this.size - 1, 0);
        return node.right;
      }

      if (!node.right) {
        this.size = Math.max(this.size - 1, 0);
        return node.left;
      }

      const successor = this.findMin(node.right);
      node.value = successor.value;
      node.right = removeNode(node.right, successor.value);
      return node;
    };

    this.root = removeNode(this.root, value);
    return !this.search(value);
  }

  deleteWithAnimation(value) {
    const steps = [];
    const record = (label, visited = [], changed = []) => {
      steps.push({
        label,
        explanation: label,
        visited: [...visited],
        changed: [...changed],
        tree: this.toSnapshot(),
      });
    };

    const remove = (node, target) => {
      if (!node) {
        record(`Value ${target} is absent`, [], []);
        return null;
      }

      if (target < node.value) {
        record(`Go left from ${node.value} to search for ${target}`, [node.value], []);
        node.left = remove(node.left, target);
        return node;
      }

      if (target > node.value) {
        record(`Go right from ${node.value} to search for ${target}`, [node.value], []);
        node.right = remove(node.right, target);
        return node;
      }

      record(`Delete node ${node.value}`, [node.value], [node.value]);

      if (!node.left && !node.right) {
        this.size = Math.max(this.size - 1, 0);
        record(`Removed leaf node ${target}`, [target], [target]);
        return null;
      }

      if (!node.left) {
        this.size = Math.max(this.size - 1, 0);
        record(`Replaced with right child ${node.right.value}`, [node.value, node.right.value], [node.right.value]);
        return node.right;
      }

      if (!node.right) {
        this.size = Math.max(this.size - 1, 0);
        record(`Replaced with left child ${node.left.value}`, [node.value, node.left.value], [node.left.value]);
        return node.left;
      }

      const successor = this.findMin(node.right);
      record(`Use inorder successor ${successor.value} to replace ${node.value}`, [node.value, successor.value], [successor.value]);
      node.value = successor.value;
      node.right = remove(node.right, successor.value);
      return node;
    };

    this.root = remove(this.root, value);
    record(`Finished deleting ${value}`, [], []);
    return steps;
  }

  toSnapshot() {
    const values = this.traverse("inorder");
    return {
      values,
      root: this.root ? this.root.value : null,
      height: this.findHeight(),
      valid: this.validateBST(),
    };
  }

  traverseWithAnimation(order = "inorder") {
    const steps = [];
    const visit = (node) => {
      if (!node) return;

      if (order === "inorder") {
        visit(node.left);
        steps.push({
          label: `Visit ${node.value}`,
          explanation: `Inorder traversal visits ${node.value} after the left subtree.`,
          visited: [node.value],
          changed: [node.value],
          tree: this.toSnapshot(),
        });
        visit(node.right);
      } else if (order === "preorder") {
        steps.push({
          label: `Visit ${node.value}`,
          explanation: `Preorder traversal visits ${node.value} before its children.`,
          visited: [node.value],
          changed: [node.value],
          tree: this.toSnapshot(),
        });
        visit(node.left);
        visit(node.right);
      } else if (order === "postorder") {
        visit(node.left);
        visit(node.right);
        steps.push({
          label: `Visit ${node.value}`,
          explanation: `Postorder traversal visits ${node.value} after both subtrees.`,
          visited: [node.value],
          changed: [node.value],
          tree: this.toSnapshot(),
        });
      } else if (order === "levelorder") {
        const queue = [node];
        while (queue.length) {
          const current = queue.shift();
          steps.push({
            label: `Visit ${current.value}`,
            explanation: `Level-order traversal visits ${current.value} from left to right across the current depth.`,
            visited: [current.value],
            changed: [current.value],
            tree: this.toSnapshot(),
          });
          if (current.left) queue.push(current.left);
          if (current.right) queue.push(current.right);
        }
      }
    };

    visit(this.root);
    return steps;
  }

  traverse(order = "inorder") {
    const values = [];
    const visit = (node) => {
      if (!node) return;
      if (order === "inorder") {
        visit(node.left);
        values.push(node.value);
        visit(node.right);
      } else if (order === "preorder") {
        values.push(node.value);
        visit(node.left);
        visit(node.right);
      } else if (order === "postorder") {
        visit(node.left);
        visit(node.right);
        values.push(node.value);
      } else if (order === "levelorder") {
        const queue = [node];
        while (queue.length) {
          const current = queue.shift();
          values.push(current.value);
          if (current.left) queue.push(current.left);
          if (current.right) queue.push(current.right);
        }
      }
    };
    visit(this.root);
    return values;
  }
}
