export class AVLNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

export class AVLTree {
  constructor(initialValues = []) {
    this.root = null;
    this.size = 0;
    initialValues.forEach((value) => this.insert(value));
  }

  countNodes(node = this.root) {
    if (!node) return 0;
    return 1 + this.countNodes(node.left) + this.countNodes(node.right);
  }

  getHeight(node = this.root) {
    return node ? node.height : 0;
  }

  getBalanceFactor(node) {
    if (!node) return 0;
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  updateHeight(node) {
    if (!node) return;
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  rotateLeft(node) {
    if (!node || !node.right) return node;
    const pivot = node.right;
    node.right = pivot.left;
    pivot.left = node;
    this.updateHeight(node);
    this.updateHeight(pivot);
    return pivot;
  }

  rotateRight(node) {
    if (!node || !node.left) return node;
    const pivot = node.left;
    node.left = pivot.right;
    pivot.right = node;
    this.updateHeight(node);
    this.updateHeight(pivot);
    return pivot;
  }

  rebalance(node) {
    if (!node) return node;
    this.updateHeight(node);

    const balance = this.getBalanceFactor(node);

    if (balance > 1) {
      if (this.getBalanceFactor(node.left) < 0) {
        node.left = this.rotateLeft(node.left);
      }
      return this.rotateRight(node);
    }

    if (balance < -1) {
      if (this.getBalanceFactor(node.right) > 0) {
        node.right = this.rotateRight(node.right);
      }
      return this.rotateLeft(node);
    }

    return node;
  }

  insert(value) {
    this.root = this.insertNode(this.root, value);
    this.size = this.countNodes(this.root);
    return this.root;
  }

  insertNode(node, value) {
    if (!node) {
      return new AVLNode(value);
    }

    if (value < node.value) {
      node.left = this.insertNode(node.left, value);
    } else {
      node.right = this.insertNode(node.right, value);
    }

    this.updateHeight(node);
    return this.rebalance(node);
  }

  insertWithAnimation(value) {
    const steps = [];

    const record = (label, explanation, visited = [], changed = [], comparison = []) => {
      steps.push({
        label,
        explanation,
        visited: [...new Set(visited)],
        changed: [...new Set(changed)],
        comparison: [...new Set(comparison)],
        tree: this.toSnapshot(),
      });
    };

    const insertNode = (node) => {
      if (!node) {
        const newNode = new AVLNode(value);
        record(
          `Insert ${value} as a leaf`,
          `Create a new node for ${value} and attach it to the tree.`,
          [value],
          [value],
          [value]
        );
        return newNode;
      }

      record(
        `Compare ${value} with ${node.value}`,
        `Decide whether ${value} belongs on the left or right of ${node.value}.`,
        [node.value],
        [],
        [node.value, value]
      );

      if (value < node.value) {
        node.left = insertNode(node.left);
      } else {
        node.right = insertNode(node.right);
      }

      this.updateHeight(node);
      const balance = this.getBalanceFactor(node);

      if (balance > 1) {
        const leftBalance = this.getBalanceFactor(node.left);
        const pivotValue = node.value;
        record(
          `Unbalanced node ${pivotValue} (BF = ${balance})`,
          `The left subtree is heavier than the right subtree, so the tree needs a right rotation.`,
          [pivotValue, node.left?.value].filter(Boolean),
          [pivotValue],
          [pivotValue, node.left?.value].filter(Boolean)
        );

        if (leftBalance < 0) {
          node.left = this.rotateLeft(node.left);
          record(
            `Apply LR rotation at ${pivotValue}`,
            `The left child is right-heavy, so rotate it left before rotating the subtree right.`,
            [pivotValue, node.left?.value].filter(Boolean),
            [pivotValue, node.left?.value].filter(Boolean),
            [pivotValue, node.left?.value].filter(Boolean)
          );
        }

        node = this.rotateRight(node);
        record(
          `Finished right rotation at ${pivotValue}`,
          `The subtree is balanced after the rotation and the AVL property is restored.`,
          [pivotValue, node.value].filter(Boolean),
          [pivotValue, node.value].filter(Boolean),
          [pivotValue, node.value].filter(Boolean)
        );
        return node;
      }

      if (balance < -1) {
        const rightBalance = this.getBalanceFactor(node.right);
        const pivotValue = node.value;
        record(
          `Unbalanced node ${pivotValue} (BF = ${balance})`,
          `The right subtree is heavier than the left subtree, so the tree needs a left rotation.`,
          [pivotValue, node.right?.value].filter(Boolean),
          [pivotValue],
          [pivotValue, node.right?.value].filter(Boolean)
        );

        if (rightBalance > 0) {
          node.right = this.rotateRight(node.right);
          record(
            `Apply RL rotation at ${pivotValue}`,
            `The right child is left-heavy, so rotate it right before rotating the subtree left.`,
            [pivotValue, node.right?.value].filter(Boolean),
            [pivotValue, node.right?.value].filter(Boolean),
            [pivotValue, node.right?.value].filter(Boolean)
          );
        }

        node = this.rotateLeft(node);
        record(
          `Finished left rotation at ${pivotValue}`,
          `The subtree is balanced after the rotation and the AVL property is restored.`,
          [pivotValue, node.value].filter(Boolean),
          [pivotValue, node.value].filter(Boolean),
          [pivotValue, node.value].filter(Boolean)
        );
        return node;
      }

      return node;
    };

    this.root = insertNode(this.root);
    this.size = this.countNodes(this.root);
    record(
      `AVL validation after insert ${value}`,
      this.validateAVL() ? `The tree remains AVL-balanced after inserting ${value}.` : `The tree still violates the AVL property after insertion.`,
      this.getNodeMetrics().map((entry) => entry.value),
      this.getNodeMetrics().map((entry) => entry.value),
      []
    );

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
        explanation: `Check whether ${value} matches the current node ${current.value}.`,
        visited: [current.value],
        changed: [],
        comparison: [current.value, value],
        tree: this.toSnapshot(),
      });

      if (value === current.value) {
        steps.push({
          label: `Found ${value}`,
          explanation: `The value ${value} was found in the AVL tree.`,
          visited: [current.value],
          changed: [current.value],
          comparison: [current.value, value],
          tree: this.toSnapshot(),
        });
        return steps;
      }

      current = value < current.value ? current.left : current.right;
    }

    steps.push({
      label: `Value ${value} not found`,
      explanation: `The search path ended without finding ${value}.`,
      visited: [],
      changed: [],
      comparison: [],
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

  delete(value) {
    this.root = this.deleteNode(this.root, value);
    this.size = this.countNodes(this.root);
    return this.search(value) === null;
  }

  deleteNode(node, value) {
    if (!node) return null;

    if (value < node.value) {
      node.left = this.deleteNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.deleteNode(node.right, value);
    } else if (!node.left || !node.right) {
      return node.left ?? node.right;
    } else {
      const successor = this.findMin(node.right);
      node.value = successor.value;
      node.right = this.deleteNode(node.right, successor.value);
    }

    this.updateHeight(node);
    return this.rebalance(node);
  }

  deleteWithAnimation(value) {
    const steps = [];

    const record = (label, explanation, visited = [], changed = [], comparison = []) => {
      steps.push({
        label,
        explanation,
        visited: [...new Set(visited)],
        changed: [...new Set(changed)],
        comparison: [...new Set(comparison)],
        tree: this.toSnapshot(),
      });
    };

    const deleteNode = (node) => {
      if (!node) {
        record(`Value ${value} not found`, `There is no node with value ${value} in the current tree.`, [], [], []);
        return null;
      }

      if (value < node.value) {
        record(`Compare ${value} with ${node.value}`, `Move left because ${value} is smaller than ${node.value}.`, [node.value], [], [node.value, value]);
        node.left = deleteNode(node.left);
      } else if (value > node.value) {
        record(`Compare ${value} with ${node.value}`, `Move right because ${value} is larger than ${node.value}.`, [node.value], [], [node.value, value]);
        node.right = deleteNode(node.right);
      } else {
        record(`Delete node ${node.value}`, `Remove the node and restore the AVL ordering invariants.`, [node.value], [node.value], [node.value]);

        if (!node.left && !node.right) {
          return null;
        }

        if (!node.left) {
          return node.right;
        }

        if (!node.right) {
          return node.left;
        }

        const successor = this.findMin(node.right);
        node.value = successor.value;
        record(`Replace deleted value with successor ${successor.value}`, `Use the inorder successor to preserve ordering.`, [node.value, successor.value], [node.value], [node.value, successor.value]);
        node.right = deleteNode(node.right);
      }

      if (!node) {
        return node;
      }

      this.updateHeight(node);
      const balance = this.getBalanceFactor(node);
      if (balance > 1 || balance < -1) {
        const pivotValue = node.value;
        record(
          `Unbalanced node ${pivotValue} after delete (BF = ${balance})`,
          `A rotation is required to re-balance this subtree after deletion.`,
          [pivotValue, node.left?.value, node.right?.value].filter(Boolean),
          [pivotValue],
          [pivotValue, node.left?.value, node.right?.value].filter(Boolean)
        );

        if (balance > 1 && this.getBalanceFactor(node.left) < 0) {
          node.left = this.rotateLeft(node.left);
          record(`Apply LR rotation after delete`, `Rotate the left child first to fix the left-right imbalance.`, [pivotValue, node.left?.value].filter(Boolean), [pivotValue], [pivotValue, node.left?.value].filter(Boolean));
        }

        if (balance < -1 && this.getBalanceFactor(node.right) > 0) {
          node.right = this.rotateRight(node.right);
          record(`Apply RL rotation after delete`, `Rotate the right child first to fix the right-left imbalance.`, [pivotValue, node.right?.value].filter(Boolean), [pivotValue], [pivotValue, node.right?.value].filter(Boolean));
        }

        if (balance > 1) {
          node = this.rotateRight(node);
          record(`Finished right rotation at ${pivotValue}`, `The right rotation restored balance to the subtree.`, [pivotValue, node.value].filter(Boolean), [pivotValue], [pivotValue, node.value].filter(Boolean));
        } else {
          node = this.rotateLeft(node);
          record(`Finished left rotation at ${pivotValue}`, `The left rotation restored balance to the subtree.`, [pivotValue, node.value].filter(Boolean), [pivotValue], [pivotValue, node.value].filter(Boolean));
        }
      }

      return node;
    };

    this.root = deleteNode(this.root);
    this.size = this.countNodes(this.root);
    record(
      `AVL validation after delete ${value}`,
      this.validateAVL() ? `The tree remains AVL-balanced after deletion.` : `The tree still violates the AVL property after deletion.`,
      this.getNodeMetrics().map((entry) => entry.value),
      this.getNodeMetrics().map((entry) => entry.value),
      []
    );

    return steps;
  }

  traverse(order = "inorder") {
    const values = [];

    const walk = (node) => {
      if (!node) return;

      if (order === "preorder") {
        values.push(node.value);
        walk(node.left);
        walk(node.right);
        return;
      }

      if (order === "postorder") {
        walk(node.left);
        walk(node.right);
        values.push(node.value);
        return;
      }

      if (order === "levelorder") {
        const queue = [node];

        while (queue.length) {
          const current = queue.shift();
          values.push(current.value);
          if (current.left) queue.push(current.left);
          if (current.right) queue.push(current.right);
        }
        return;
      }

      walk(node.left);
      values.push(node.value);
      walk(node.right);
    };

    walk(this.root);
    return values;
  }

  traverseWithAnimation(order = "inorder") {
    const steps = [];

    const walk = (node) => {
      if (!node) return;

      if (order === "preorder") {
        steps.push({
          label: `Visit ${node.value}`,
          explanation: `Preorder visits ${node.value} before both children.`,
          visited: [node.value],
          changed: [node.value],
          comparison: [node.value],
          tree: this.toSnapshot(),
        });
        walk(node.left);
        walk(node.right);
        return;
      }

      if (order === "postorder") {
        walk(node.left);
        walk(node.right);
        steps.push({
          label: `Visit ${node.value}`,
          explanation: `Postorder visits ${node.value} after both children.`,
          visited: [node.value],
          changed: [node.value],
          comparison: [node.value],
          tree: this.toSnapshot(),
        });
        return;
      }

      if (order === "levelorder") {
        const queue = [node];
        while (queue.length) {
          const current = queue.shift();
          steps.push({
            label: `Visit ${current.value}`,
            explanation: `Level-order traversal reaches ${current.value} at its depth.`,
            visited: [current.value],
            changed: [current.value],
            comparison: [current.value],
            tree: this.toSnapshot(),
          });
          if (current.left) queue.push(current.left);
          if (current.right) queue.push(current.right);
        }
        return;
      }

      walk(node.left);
      steps.push({
        label: `Visit ${node.value}`,
        explanation: `Inorder visits ${node.value} between both child subtrees.`,
        visited: [node.value],
        changed: [node.value],
        comparison: [node.value],
        tree: this.toSnapshot(),
      });
      walk(node.right);
    };

    walk(this.root);
    return steps;
  }

  validateAVL(node = this.root) {
    if (!node) return true;

    const check = (current) => {
      if (!current) {
        return { valid: true, height: 0 };
      }

      const left = check(current.left);
      const right = check(current.right);

      if (!left.valid || !right.valid) {
        return { valid: false, height: 0 };
      }

      if (Math.abs(left.height - right.height) > 1) {
        return { valid: false, height: 0 };
      }

      const height = 1 + Math.max(left.height, right.height);
      return { valid: true, height };
    };

    return check(node).valid;
  }

  getNodeMetrics(node = this.root, metrics = []) {
    if (!node) return metrics;
    this.getNodeMetrics(node.left, metrics);
    metrics.push({
      value: node.value,
      height: node.height,
      balanceFactor: this.getBalanceFactor(node),
    });
    this.getNodeMetrics(node.right, metrics);
    return metrics;
  }

  toSnapshot() {
    const clone = (current) => {
      if (!current) return null;
      const next = new AVLNode(current.value);
      next.left = clone(current.left);
      next.right = clone(current.right);
      next.height = current.height;
      return next;
    };

    return clone(this.root);
  }
}
