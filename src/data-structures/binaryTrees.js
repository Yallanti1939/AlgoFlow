export class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

export class BinaryTree {
  constructor(initialValues = []) {
    this.root = null;
    this.size = 0;
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
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = node;
          this.size += 1;
          return node;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = node;
          this.size += 1;
          return node;
        }
        current = current.right;
      }
    }
  }

  insertMany(values) {
    values.forEach((value) => this.insert(value));
    return this;
  }

  search(value) {
    let current = this.root;
    while (current) {
      if (value === current.value) return current;
      current = value < current.value ? current.left : current.right;
    }
    return null;
  }

  minValue(node = this.root) {
    let current = node;
    while (current && current.left) {
      current = current.left;
    }
    return current ? current.value : null;
  }

  maxValue(node = this.root) {
    let current = node;
    while (current && current.right) {
      current = current.right;
    }
    return current ? current.value : null;
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

      const next = this.minNode(node.right);
      node.value = next.value;
      node.right = removeNode(node.right, next.value);
      return node;
    };

    this.root = removeNode(this.root, value);
    return this.search(value) === null;
  }

  minNode(node) {
    let current = node;
    while (current && current.left) {
      current = current.left;
    }
    return current;
  }

  height(node = this.root) {
    if (!node) return 0;
    return 1 + Math.max(this.height(node.left), this.height(node.right));
  }

  isBalanced(node = this.root) {
    if (!node) return true;
    const leftHeight = this.height(node.left);
    const rightHeight = this.height(node.right);
    return Math.abs(leftHeight - rightHeight) <= 1 && this.isBalanced(node.left) && this.isBalanced(node.right);
  }

  traverse(order = "inorder") {
    const values = [];
    switch (order) {
      case "preorder":
        this._preorder(this.root, values);
        break;
      case "postorder":
        this._postorder(this.root, values);
        break;
      case "levelorder":
        this._levelOrder(this.root, values);
        break;
      case "inorder":
      default:
        this._inorder(this.root, values);
        break;
    }
    return values;
  }

  stepsFor(order = "inorder") {
    const steps = [];
    const walk = (node) => {
      if (!node) return;

      switch (order) {
        case "preorder":
          steps.push({ label: `Visit ${node.value}`, explanation: `Preorder visits ${node.value} before its children.` });
          walk(node.left);
          walk(node.right);
          break;
        case "postorder":
          walk(node.left);
          walk(node.right);
          steps.push({ label: `Visit ${node.value}`, explanation: `Postorder visits ${node.value} after both children.` });
          break;
        case "levelorder": {
          const queue = [node];
          while (queue.length) {
            const current = queue.shift();
            steps.push({ label: `Visit ${current.value}`, explanation: `Level-order traversal visits ${current.value} at this depth.` });
            if (current.left) queue.push(current.left);
            if (current.right) queue.push(current.right);
          }
          break;
        }
        case "inorder":
        default:
          walk(node.left);
          steps.push({ label: `Visit ${node.value}`, explanation: `Inorder visits ${node.value} between its left and right subtrees.` });
          walk(node.right);
          break;
      }
    };

    walk(this.root);
    return steps;
  }

  _inorder(node, values) {
    if (!node) return;
    this._inorder(node.left, values);
    values.push(node.value);
    this._inorder(node.right, values);
  }

  _preorder(node, values) {
    if (!node) return;
    values.push(node.value);
    this._preorder(node.left, values);
    this._preorder(node.right, values);
  }

  _postorder(node, values) {
    if (!node) return;
    this._postorder(node.left, values);
    this._postorder(node.right, values);
    values.push(node.value);
  }

  _levelOrder(node, values) {
    if (!node) return;
    const queue = [node];
    while (queue.length) {
      const current = queue.shift();
      values.push(current.value);
      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }
  }

  clear() {
    this.root = null;
    this.size = 0;
  }

  toArray() {
    return this.traverse("inorder");
  }

  toNodeMap() {
    const output = [];
    const visit = (node, depth = 0, x = 0) => {
      if (!node) return;
      output.push({ value: node.value, depth, x, left: !!node.left, right: !!node.right });
      visit(node.left, depth + 1, x - 1);
      visit(node.right, depth + 1, x + 1);
    };
    visit(this.root);
    return output;
  }
}
