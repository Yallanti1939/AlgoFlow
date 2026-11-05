export class SegmentTree {
  constructor(initialValues = []) {
    this.values = Array.isArray(initialValues) ? [...initialValues] : [];
    this.size = this.values.length;
    this.tree = new Array(Math.max(1, 4 * this.size)).fill(0);
    this.minTree = new Array(Math.max(1, 4 * this.size)).fill(Number.POSITIVE_INFINITY);
    this.lazy = new Array(Math.max(1, 4 * this.size)).fill(0);

    if (this.size > 0) {
      this._build(1, 0, this.size - 1);
    }
  }

  _asStep(label, explanation, options = {}) {
    const {
      visited = [],
      updated = [],
      range = null,
      result = null,
      mode = "sum",
    } = options;

    return {
      label,
      explanation,
      visited: [...new Set(visited)],
      updated: [...new Set(updated)],
      range: range ? { start: range[0], end: range[1] } : null,
      result,
      mode,
      array: [...this.values],
      tree: [...this.tree],
      minTree: [...this.minTree],
      lazy: [...this.lazy],
      nodes: this.describeTree(mode),
    };
  }

  describeTree(mode = "sum") {
    if (this.size === 0) {
      return [];
    }

    const nodes = [];

    const walk = (node, left, right) => {
      if (node >= this.tree.length || left > right) {
        return;
      }

      const value = mode === "min" ? this.minTree[node] : this.tree[node];
      nodes.push({
        id: node,
        left,
        right,
        value: Number.isFinite(value) ? value : 0,
      });

      if (left !== right) {
        const middle = Math.floor((left + right) / 2);
        walk(node * 2, left, middle);
        walk(node * 2 + 1, middle + 1, right);
      }
    };

    walk(1, 0, this.size - 1);
    return nodes;
  }

  _build(node, left, right) {
    if (left === right) {
      this.tree[node] = this.values[left];
      this.minTree[node] = this.values[left];
      return;
    }

    const mid = Math.floor((left + right) / 2);
    this._build(node * 2, left, mid);
    this._build(node * 2 + 1, mid + 1, right);

    this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1];
    this.minTree[node] = Math.min(this.minTree[node * 2], this.minTree[node * 2 + 1]);
  }

  _apply(node, delta, segmentLength) {
    this.tree[node] += delta * segmentLength;
    this.minTree[node] += delta;
    this.lazy[node] += delta;
  }

  _push(node, left, right) {
    if (this.lazy[node] === 0 || left === right) {
      return;
    }

    const mid = Math.floor((left + right) / 2);
    const leftLength = mid - left + 1;
    const rightLength = right - mid;
    const delta = this.lazy[node];

    this._apply(node * 2, delta, leftLength);
    this._apply(node * 2 + 1, delta, rightLength);
    this.lazy[node] = 0;
  }

  _recalculate(node) {
    this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1];
    this.minTree[node] = Math.min(this.minTree[node * 2], this.minTree[node * 2 + 1]);
  }

  _rangeSumQuery(node, left, right, queryLeft, queryRight, steps) {
    if (queryRight < left || queryLeft > right) {
      return 0;
    }

    if (queryLeft <= left && right <= queryRight) {
      steps.push(
        this._asStep(
          `Visit segment [${left}, ${right}]`,
          `This segment is completely inside the query and contributes ${this.tree[node]} to the range sum.`,
          {
            visited: [node],
            range: [queryLeft, queryRight],
            result: this.tree[node],
            mode: "sum",
          }
        )
      );
      return this.tree[node];
    }

    this._push(node, left, right);
    const mid = Math.floor((left + right) / 2);
    let result = 0;

    if (queryLeft <= mid) {
      result += this._rangeSumQuery(node * 2, left, mid, queryLeft, queryRight, steps);
    }

    if (queryRight > mid) {
      result += this._rangeSumQuery(node * 2 + 1, mid + 1, right, queryLeft, queryRight, steps);
    }

    return result;
  }

  _rangeMinQuery(node, left, right, queryLeft, queryRight, steps) {
    if (queryRight < left || queryLeft > right) {
      return Number.POSITIVE_INFINITY;
    }

    if (queryLeft <= left && right <= queryRight) {
      steps.push(
        this._asStep(
          `Visit segment [${left}, ${right}]`,
          `This segment is completely inside the query and its minimum value is ${this.minTree[node]}.`,
          {
            visited: [node],
            range: [queryLeft, queryRight],
            result: this.minTree[node],
            mode: "min",
          }
        )
      );
      return this.minTree[node];
    }

    this._push(node, left, right);
    const mid = Math.floor((left + right) / 2);
    let result = Number.POSITIVE_INFINITY;

    if (queryLeft <= mid) {
      result = Math.min(result, this._rangeMinQuery(node * 2, left, mid, queryLeft, queryRight, steps));
    }

    if (queryRight > mid) {
      result = Math.min(result, this._rangeMinQuery(node * 2 + 1, mid + 1, right, queryLeft, queryRight, steps));
    }

    return result;
  }

  _pointUpdate(node, left, right, index, newValue, steps) {
    if (left === right) {
      this.values[index] = newValue;
      this.tree[node] = newValue;
      this.minTree[node] = newValue;
      this.lazy[node] = 0;
      steps.push(
        this._asStep(
          `Update index ${index}`,
          `The leaf at index ${index} is set to ${newValue}.`,
          {
            visited: [node],
            updated: [node],
            range: [index, index],
            result: newValue,
            mode: "sum",
          }
        )
      );
      return;
    }

    this._push(node, left, right);
    const mid = Math.floor((left + right) / 2);

    if (index <= mid) {
      this._pointUpdate(node * 2, left, mid, index, newValue, steps);
    } else {
      this._pointUpdate(node * 2 + 1, mid + 1, right, index, newValue, steps);
    }

    this._recalculate(node);
  }

  _rangeUpdate(node, left, right, updateLeft, updateRight, delta, steps) {
    if (updateRight < left || updateLeft > right) {
      return;
    }

    if (updateLeft <= left && right <= updateRight) {
      const segmentLength = right - left + 1;
      this._apply(node, delta, segmentLength);
      for (let index = left; index <= right; index += 1) {
        this.values[index] += delta;
      }
      steps.push(
        this._asStep(
          `Apply +${delta} to segment [${left}, ${right}]`,
          `Lazy propagation applies a uniform increment across this entire node interval without touching every descendant immediately.`,
          {
            visited: [node],
            updated: [node],
            range: [updateLeft, updateRight],
            result: this.tree[node],
            mode: "sum",
          }
        )
      );
      return;
    }

    this._push(node, left, right);
    const mid = Math.floor((left + right) / 2);

    if (updateLeft <= mid) {
      this._rangeUpdate(node * 2, left, mid, updateLeft, updateRight, delta, steps);
    }

    if (updateRight > mid) {
      this._rangeUpdate(node * 2 + 1, mid + 1, right, updateLeft, updateRight, delta, steps);
    }

    this._recalculate(node);
  }

  rangeSumQuery(left, right) {
    const steps = [];

    if (this.size === 0) {
      steps.push(
        this._asStep("Empty array", "There are no values to sum in the segment tree.", {
          range: [left, right],
          mode: "sum",
        })
      );
      return steps;
    }

    if (left < 0 || right >= this.size || left > right) {
      steps.push(
        this._asStep(
          "Invalid query range",
          `The query range [${left}, ${right}] is outside the valid index range [0, ${this.size - 1}].`,
          { range: [left, right], mode: "sum" }
        )
      );
      return steps;
    }

    const result = this._rangeSumQuery(1, 0, this.size - 1, left, right, steps);
    steps.push(
      this._asStep(
        "Range sum result",
        `The sum across [${left}, ${right}] is ${result}.`,
        {
          visited: steps.flatMap((step) => step.visited),
          range: [left, right],
          result,
          mode: "sum",
        }
      )
    );

    return steps;
  }

  rangeMinQuery(left, right) {
    const steps = [];

    if (this.size === 0) {
      steps.push(
        this._asStep("Empty array", "There are no values to inspect in the segment tree.", {
          range: [left, right],
          mode: "min",
        })
      );
      return steps;
    }

    if (left < 0 || right >= this.size || left > right) {
      steps.push(
        this._asStep(
          "Invalid query range",
          `The query range [${left}, ${right}] is outside the valid index range [0, ${this.size - 1}].`,
          { range: [left, right], mode: "min" }
        )
      );
      return steps;
    }

    const result = this._rangeMinQuery(1, 0, this.size - 1, left, right, steps);
    steps.push(
      this._asStep(
        "Range minimum result",
        `The minimum value across [${left}, ${right}] is ${result}.`,
        {
          visited: steps.flatMap((step) => step.visited),
          range: [left, right],
          result,
          mode: "min",
        }
      )
    );

    return steps;
  }

  pointUpdate(index, newValue) {
    const steps = [];

    if (this.size === 0) {
      steps.push(
        this._asStep("Empty array", "A point update cannot run on an empty tree.", {
          range: [index, index],
          mode: "sum",
        })
      );
      return steps;
    }

    if (index < 0 || index >= this.size) {
      steps.push(
        this._asStep(
          "Invalid index",
          `Index ${index} is outside the valid range [0, ${this.size - 1}].`,
          { range: [index, index], mode: "sum" }
        )
      );
      return steps;
    }

    const oldValue = this.values[index];
    if (oldValue === newValue) {
      steps.push(
        this._asStep(
          `No change at index ${index}`,
          `The new value ${newValue} matches the existing value, so the tree stays unchanged.`,
          {
            visited: [index],
            updated: [index],
            range: [index, index],
            result: newValue,
            mode: "sum",
          }
        )
      );
      return steps;
    }

    const updateSteps = [];
    this._pointUpdate(1, 0, this.size - 1, index, newValue, updateSteps);
    steps.push(...updateSteps);
    steps.push(
      this._asStep(
        "Point update complete",
        `The tree was updated at index ${index} from ${oldValue} to ${newValue}.`,
        {
          visited: updateSteps.flatMap((step) => step.visited),
          updated: [index],
          range: [index, index],
          result: newValue,
          mode: "sum",
        }
      )
    );

    return steps;
  }

  rangeUpdate(left, right, delta) {
    const steps = [];

    if (this.size === 0) {
      steps.push(
        this._asStep("Empty array", "Range updates are not meaningful on an empty tree.", {
          range: [left, right],
          mode: "sum",
        })
      );
      return steps;
    }

    if (left < 0 || right >= this.size || left > right) {
      steps.push(
        this._asStep(
          "Invalid update range",
          `The update range [${left}, ${right}] is outside the valid index range [0, ${this.size - 1}].`,
          { range: [left, right], mode: "sum" }
        )
      );
      return steps;
    }

    const updateSteps = [];
    this._rangeUpdate(1, 0, this.size - 1, left, right, delta, updateSteps);
    steps.push(...updateSteps);
    steps.push(
      this._asStep(
        "Range update complete",
        `Every value in [${left}, ${right}] was increased by ${delta}.`,
        {
          visited: updateSteps.flatMap((step) => step.visited),
          updated: updateSteps.flatMap((step) => step.updated),
          range: [left, right],
          result: this.values.slice(left, right + 1),
          mode: "sum",
        }
      )
    );

    return steps;
  }

  toArray() {
    return [...this.values];
  }
}

export default SegmentTree;
