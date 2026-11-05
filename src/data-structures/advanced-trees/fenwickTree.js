export class FenwickTree {
  constructor(initialValues = []) {
    this.values = Array.isArray(initialValues) ? [...initialValues] : [];
    this.size = this.values.length;
    this.tree = new Array(this.size + 1).fill(0);

    if (this.size > 0) {
      for (let index = 0; index < this.size; index += 1) {
        this._add(index + 1, this.values[index]);
      }
    }
  }

  _snapshot(label, explanation, options = {}) {
    const {
      highlighted = [],
      range = null,
      result = null,
      before = null,
      after = null,
    } = options;

    return {
      label,
      explanation,
      highlighted: [...new Set(highlighted)],
      range: range ? { start: range[0], end: range[1] } : null,
      result,
      before,
      after,
      array: [...this.values],
      bit: [...this.tree],
      nodes: this.values.map((value, index) => ({
        index,
        value,
        bitValue: this.tree[index + 1] ?? 0,
      })),
    };
  }

  _add(index, delta) {
    while (index <= this.size) {
      this.tree[index] += delta;
      index += index & -index;
    }
  }

  _pathIndices(index) {
    const visited = [];
    let current = index;

    while (current > 0) {
      visited.push(current);
      current -= current & -current;
    }

    return visited;
  }

  prefixSum(index) {
    const steps = [];

    if (this.size === 0) {
      steps.push(
        this._snapshot("Empty array", "There are no values to sum in a Fenwick tree.", {
          range: [index, index],
        })
      );
      return steps;
    }

    if (index < 0 || index >= this.size) {
      steps.push(
        this._snapshot(
          "Invalid index",
          `Index ${index} is outside the valid range [0, ${this.size - 1}].`,
          { highlighted: [], range: [index, index] }
        )
      );
      return steps;
    }

    let total = 0;
    let current = index + 1;
    const visited = [];

    while (current > 0) {
      visited.push(current);
      total += this.tree[current];
      current -= current & -current;
    }

    steps.push(
      this._snapshot(
        `Prefix sum to index ${index}`,
        `A Fenwick tree walks the ancestor indices of ${index} to accumulate the prefix total from the start of the array to this point.`,
        {
          highlighted: visited,
          range: [0, index],
          result: total,
        }
      )
    );

    return steps;
  }

  rangeSum(left, right) {
    const steps = [];

    if (this.size === 0) {
      steps.push(this._snapshot("Empty array", "Range sums are undefined for an empty Fenwick tree.", {
        range: [left, right],
      }));
      return steps;
    }

    if (left < 0 || right < 0 || left >= this.size || right >= this.size || left > right) {
      steps.push(
        this._snapshot(
          "Invalid range",
          `The query range [${left}, ${right}] is outside the valid index range [0, ${this.size - 1}].`,
          { range: [left, right] }
        )
      );
      return steps;
    }

    const leftTotal = this.prefixSum(left - 1).at(-1)?.result ?? 0;
    const rightTotal = this.prefixSum(right).at(-1)?.result ?? 0;
    const result = rightTotal - leftTotal;

    steps.push(
      this._snapshot(
        `Range sum [${left}, ${right}]`,
        `The range sum is computed as prefix(${right}) - prefix(${left - 1}).`,
        {
          highlighted: [...new Set([...this._pathIndices(right + 1), ...this._pathIndices(left)])],
          range: [left, right],
          result,
        }
      )
    );

    return steps;
  }

  pointUpdate(index, newValue) {
    const steps = [];

    if (this.size === 0) {
      steps.push(this._snapshot("Empty array", "A point update cannot run on an empty Fenwick tree.", {
        range: [index, index],
      }));
      return steps;
    }

    if (index < 0 || index >= this.size) {
      steps.push(
        this._snapshot(
          "Invalid index",
          `Index ${index} is outside the valid range [0, ${this.size - 1}].`,
          { range: [index, index] }
        )
      );
      return steps;
    }

    const previousValue = this.values[index];
    const delta = newValue - previousValue;

    if (delta === 0) {
      steps.push(
        this._snapshot(
          `No change at index ${index}`,
          `The value is already ${newValue}, so no BIT propagation is needed.`,
          {
            highlighted: [index + 1],
            range: [index, index],
            before: previousValue,
            after: newValue,
            result: newValue,
          }
        )
      );
      return steps;
    }

    this.values[index] = newValue;
    this._add(index + 1, delta);

    steps.push(
      this._snapshot(
        `Update index ${index}`,
        `The BIT adds the difference ${delta} across every ancestor node that covers this index.`,
        {
          highlighted: this._pathIndices(index + 1),
          range: [index, index],
          before: previousValue,
          after: newValue,
          result: newValue,
        }
      )
    );

    return steps;
  }

  setValue(index, newValue) {
    return this.pointUpdate(index, newValue);
  }

  getValue(index) {
    if (index < 0 || index >= this.size) {
      return null;
    }

    return this.values[index];
  }

  toArray() {
    return [...this.values];
  }
}

export default FenwickTree;
