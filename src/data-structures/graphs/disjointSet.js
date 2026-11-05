function isValidElement(element) {
  return typeof element === "string"
    || (typeof element === "number" && Number.isFinite(element));
}

function normalizeElement(element) {
  return element === 0 ? 0 : element;
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

export class DisjointSet {
  constructor(elements = []) {
    if (!Array.isArray(elements)) {
      throw new TypeError("DisjointSet initialization requires an array of elements.");
    }

    this.parent = new Map();
    this.size = new Map();
    this.elements = [];
    this.componentCount = 0;
    this.steps = [];

    elements.forEach((element) => this._addElement(element));
    this._record("Initialize disjoint sets", "Each unique element begins in its own set.");
  }

  _validateElement(element) {
    if (!isValidElement(element)) {
      throw new TypeError("Disjoint-set elements must be strings or finite numbers.");
    }
    return normalizeElement(element);
  }

  _addElement(element) {
    const value = this._validateElement(element);
    if (this.parent.has(value)) return false;

    this.parent.set(value, value);
    this.size.set(value, 1);
    this.elements.push(value);
    this.componentCount += 1;
    return true;
  }

  _validateKnownElement(element) {
    const value = this._validateElement(element);
    if (!this.parent.has(value)) {
      throw new RangeError(`Unknown disjoint-set element: ${String(value)}`);
    }
    return value;
  }

  _rootWithoutCompression(element) {
    let root = element;
    while (this.parent.get(root) !== root) {
      root = this.parent.get(root);
    }
    return root;
  }

  _snapshot(label, explanation, state = {}) {
    const components = this.getComponents();
    const roots = components.map((component) => this._rootWithoutCompression(component[0]));
    return deepFreeze({
      label,
      explanation,
      operation: state.operation ?? null,
      current: state.current ?? null,
      currentPath: [...(state.currentPath ?? [])],
      compressed: [...(state.compressed ?? [])],
      result: state.result ?? null,
      elements: [...this.elements],
      parent: this.elements.map((element) => [element, this.parent.get(element)]),
      sizes: roots.map((root) => [root, this.size.get(root)]),
      roots,
      components,
      componentCount: this.componentCount,
    });
  }

  _record(label, explanation, state = {}) {
    this.steps.push(this._snapshot(label, explanation, state));
  }

  _beginOperation() {
    this.steps = [];
  }

  _find(element, operation, currentPath = []) {
    const path = [];
    let root = element;
    while (this.parent.get(root) !== root) {
      path.push(root);
      this._record(
        `Follow parent of ${String(root)}`,
        `${String(root)} points to ${String(this.parent.get(root))}; continue toward the representative.`,
        { operation, current: root, currentPath: [...currentPath, ...path] }
      );
      root = this.parent.get(root);
    }
    path.push(root);

    this._record(
      `Reach representative ${String(root)}`,
      `${String(root)} is the root representative for this component.`,
      { operation, current: root, currentPath: [...currentPath, ...path] }
    );

    const compressed = [];
    for (const node of path.slice(0, -1)) {
      if (this.parent.get(node) !== root) {
        this.parent.set(node, root);
        compressed.push(node);
        this._record(
          `Compress path at ${String(node)}`,
          `Set ${String(node)}'s parent directly to representative ${String(root)}.`,
          {
            operation,
            current: node,
            currentPath: [...currentPath, ...path],
            compressed: [...compressed],
          }
        );
      }
    }

    return { root, path: [...currentPath, ...path], compressed };
  }

  makeSet(element) {
    this._beginOperation();
    const value = this._validateElement(element);
    const added = this._addElement(value);
    this._record(
      added ? `Make set for ${String(value)}` : `${String(value)} already exists`,
      added
        ? `${String(value)} becomes a new one-element component.`
        : "Duplicate initialization is ignored; the existing component is unchanged.",
      { operation: "makeSet", current: value, result: added }
    );
    return added;
  }

  find(element) {
    this._beginOperation();
    const value = this._validateKnownElement(element);
    const { root, path, compressed } = this._find(value, "find");
    this._record(
      `Find complete: ${String(root)}`,
      compressed.length
        ? `The path was compressed for ${compressed.map(String).join(", ")}.`
        : "The representative was found; no parent links needed compression.",
      { operation: "find", current: root, currentPath: path, compressed, result: root }
    );
    return root;
  }

  union(left, right) {
    this._beginOperation();
    const leftValue = this._validateKnownElement(left);
    const rightValue = this._validateKnownElement(right);
    this._record(
      `Compare components for ${String(leftValue)} and ${String(rightValue)}`,
      "Find both representatives before deciding whether their components can be merged.",
      { operation: "union", currentPath: [leftValue, rightValue] }
    );

    let leftRoot = this._find(leftValue, "union").root;
    let rightRoot = this._find(rightValue, "union", [leftValue]).root;
    if (leftRoot === rightRoot) {
      this._record(
        "Components already connected",
        "Both elements have the same representative; no merge is needed.",
        { operation: "union", current: leftRoot, currentPath: [leftValue, rightValue], result: false }
      );
      return false;
    }

    if (this.size.get(leftRoot) < this.size.get(rightRoot)) {
      [leftRoot, rightRoot] = [rightRoot, leftRoot];
    }

    this._record(
      `Attach smaller component ${String(rightRoot)}`,
      `${String(leftRoot)}'s component is at least as large, so attach the smaller root beneath it.`,
      { operation: "union", current: rightRoot, currentPath: [leftRoot, rightRoot] }
    );
    this.parent.set(rightRoot, leftRoot);
    this.size.set(leftRoot, this.size.get(leftRoot) + this.size.get(rightRoot));
    this.size.delete(rightRoot);
    this.componentCount -= 1;

    this._record(
      `Merge complete: ${String(leftRoot)} represents the component`,
      `The components are merged by size. The component now contains ${this.size.get(leftRoot)} elements.`,
      { operation: "union", current: leftRoot, currentPath: [leftRoot, rightRoot], result: true }
    );
    return true;
  }

  connected(left, right) {
    this._beginOperation();
    const leftValue = this._validateKnownElement(left);
    const rightValue = this._validateKnownElement(right);
    const leftRoot = this._find(leftValue, "connected").root;
    const rightRoot = this._find(rightValue, "connected", [leftValue]).root;
    const result = leftRoot === rightRoot;
    this._record(
      result ? "Elements are connected" : "Elements are in different components",
      result
        ? `Both elements resolve to representative ${String(leftRoot)}.`
        : `${String(leftRoot)} and ${String(rightRoot)} are different representatives.`,
      { operation: "connected", currentPath: [leftValue, rightValue], result }
    );
    return result;
  }

  getComponentSize(element) {
    const value = this._validateKnownElement(element);
    return this.size.get(this._rootWithoutCompression(value));
  }

  getComponentCount() {
    return this.componentCount;
  }

  getComponents() {
    const groups = new Map();
    for (const element of this.elements) {
      const root = this._rootWithoutCompression(element);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(element);
    }
    return [...groups.values()].map((component) => [...component]);
  }

  getSnapshot(label = "Current disjoint sets", explanation = "Current parent forest and component membership.") {
    return this._snapshot(label, explanation);
  }

  getSteps() {
    return [...this.steps];
  }
}

export default DisjointSet;
