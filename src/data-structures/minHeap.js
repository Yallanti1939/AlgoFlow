export class MinHeap {
  constructor(initialValues = []) {
    this.values = [];
    initialValues.forEach((value) => this.insert(value));
  }

  get size() {
    return this.values.length;
  }

  get root() {
    return this.values[0] ?? null;
  }

  leftChildIndex(index) {
    return 2 * index + 1;
  }

  rightChildIndex(index) {
    return 2 * index + 2;
  }

  parentIndex(index) {
    return Math.floor((index - 1) / 2);
  }

  swap(indexA, indexB) {
    [this.values[indexA], this.values[indexB]] = [this.values[indexB], this.values[indexA]];
  }

  peek() {
    return this.values[0] ?? null;
  }

  toArray() {
    return [...this.values];
  }

  toSnapshot() {
    return [...this.values];
  }

  heapifyUp(index) {
    while (index > 0) {
      const parentIndex = this.parentIndex(index);
      if (this.values[parentIndex] <= this.values[index]) {
        break;
      }
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  heapifyDown(index) {
    let currentIndex = index;

    while (true) {
      const leftIndex = this.leftChildIndex(currentIndex);
      const rightIndex = this.rightChildIndex(currentIndex);
      let smallest = currentIndex;

      if (leftIndex < this.values.length && this.values[leftIndex] < this.values[currentIndex]) {
        smallest = leftIndex;
      }

      if (rightIndex < this.values.length && this.values[rightIndex] < this.values[smallest]) {
        smallest = rightIndex;
      }

      if (smallest === currentIndex) {
        break;
      }

      this.swap(currentIndex, smallest);
      currentIndex = smallest;
    }
  }

  insert(value) {
    this.values.push(value);
    this.heapifyUp(this.values.length - 1);
    return value;
  }

  insertWithAnimation(value) {
    const steps = [];
    const record = (label, explanation, compared = [], swapped = []) => {
      steps.push({
        label,
        explanation,
        visited: [...new Set(compared)],
        changed: [...new Set(swapped)],
        tree: [...this.values],
      });
    };

    this.values.push(value);
    record(`Insert ${value}`, `Add ${value} to the end of the heap array.`, [this.values.length - 1], [this.values.length - 1]);

    let index = this.values.length - 1;
    while (index > 0) {
      const parentIndex = this.parentIndex(index);
      if (this.values[parentIndex] <= this.values[index]) {
        break;
      }

      record(
        `Compare ${this.values[index]} with parent ${this.values[parentIndex]}`,
        `The child is smaller than its parent, so swap to restore the min-heap property.`,
        [index, parentIndex],
        [index, parentIndex]
      );

      this.swap(index, parentIndex);
      index = parentIndex;
    }

    record(`Min-heap insertion complete for ${value}`, `The heap ordering is now valid after the insertion.`, [0], []);
    return steps;
  }

  extractMin() {
    if (this.values.length === 0) {
      return null;
    }

    const minValue = this.values[0];
    const lastValue = this.values.pop();

    if (this.values.length > 0) {
      this.values[0] = lastValue;
      this.heapifyDown(0);
    }

    return minValue;
  }

  extractMinWithAnimation() {
    const steps = [];
    const record = (label, explanation, compared = [], swapped = []) => {
      steps.push({
        label,
        explanation,
        visited: [...new Set(compared)],
        changed: [...new Set(swapped)],
        tree: [...this.values],
      });
    };

    if (this.values.length === 0) {
      record("Heap is empty", "There is no minimum value to extract.", [], []);
      return steps;
    }

    const minValue = this.values[0];
    const lastValue = this.values.pop();
    record(`Extract minimum ${minValue}`, `Remove the root from the min-heap and replace it with the last item.`, [0, this.values.length], [0]);

    if (this.values.length === 0) {
      record("Heap now empty", "The heap contains no remaining values.", [], []);
      return steps;
    }

    this.values[0] = lastValue;
    let currentIndex = 0;

    while (true) {
      const leftIndex = this.leftChildIndex(currentIndex);
      const rightIndex = this.rightChildIndex(currentIndex);
      let smallest = currentIndex;

      if (leftIndex < this.values.length && this.values[leftIndex] < this.values[currentIndex]) {
        smallest = leftIndex;
      }

      if (rightIndex < this.values.length && this.values[rightIndex] < this.values[smallest]) {
        smallest = rightIndex;
      }

      if (smallest === currentIndex) {
        break;
      }

      record(
        `Sink ${this.values[currentIndex]} down the heap`,
        `Swap the smaller child upward until the heap ordering is restored.`,
        [currentIndex, smallest],
        [currentIndex, smallest]
      );

      this.swap(currentIndex, smallest);
      currentIndex = smallest;
    }

    record(`Min extraction complete`, `The extracted minimum was ${minValue}.`, [0], []);
    return steps;
  }

  delete(value) {
    const index = this.values.indexOf(value);
    if (index === -1) {
      return false;
    }

    const lastValue = this.values.pop();
    if (index < this.values.length) {
      this.values[index] = lastValue;
      if (index > 0 && this.values[this.parentIndex(index)] > this.values[index]) {
        this.heapifyUp(index);
      } else {
        this.heapifyDown(index);
      }
    }

    return true;
  }

  deleteWithAnimation(value) {
    const steps = [];
    const record = (label, explanation, compared = [], swapped = []) => {
      steps.push({
        label,
        explanation,
        visited: [...new Set(compared)],
        changed: [...new Set(swapped)],
        tree: [...this.values],
      });
    };

    const index = this.values.indexOf(value);
    if (index === -1) {
      record(`Value ${value} not found`, `The requested value is not present in the heap.`, [], []);
      return steps;
    }

    record(`Delete value ${value} at index ${index}`, `Remove the target node and restore the heap order.`, [index], [index]);
    const lastValue = this.values.pop();

    if (this.values.length === 0) {
      record("Heap is empty after delete", `The heap was reduced to zero elements.`, [], []);
      return steps;
    }

    if (index < this.values.length) {
      this.values[index] = lastValue;
      if (index > 0 && this.values[this.parentIndex(index)] > this.values[index]) {
        let cursor = index;
        while (cursor > 0) {
          const parentIndex = this.parentIndex(cursor);
          if (this.values[parentIndex] <= this.values[cursor]) {
            break;
          }
          record(
            `Bubble ${this.values[cursor]} up`,
            `The reinserted value is smaller than its parent, so it must rise.`,
            [cursor, parentIndex],
            [cursor, parentIndex]
          );
          this.swap(cursor, parentIndex);
          cursor = parentIndex;
        }
      } else {
        let cursor = index;
        while (true) {
          const leftIndex = this.leftChildIndex(cursor);
          const rightIndex = this.rightChildIndex(cursor);
          let smallest = cursor;

          if (leftIndex < this.values.length && this.values[leftIndex] < this.values[cursor]) {
            smallest = leftIndex;
          }

          if (rightIndex < this.values.length && this.values[rightIndex] < this.values[smallest]) {
            smallest = rightIndex;
          }

          if (smallest === cursor) {
            break;
          }

          record(
            `Sink ${this.values[cursor]} down`,
            `Move the smaller child upward until the heap is valid again.`,
            [cursor, smallest],
            [cursor, smallest]
          );

          this.swap(cursor, smallest);
          cursor = smallest;
        }
      }
    }

    record(`Deletion complete for ${value}`, `Heap ordering is restored after deleting ${value}.`, [0], []);
    return steps;
  }

  buildHeap(values) {
    this.values = [...values];
    for (let index = Math.floor(this.values.length / 2) - 1; index >= 0; index -= 1) {
      this.heapifyDown(index);
    }
    return this.values;
  }

  validateMinHeap() {
    for (let index = 0; index < this.values.length; index += 1) {
      const leftIndex = this.leftChildIndex(index);
      const rightIndex = this.rightChildIndex(index);
      if (leftIndex < this.values.length && this.values[leftIndex] < this.values[index]) {
        return false;
      }
      if (rightIndex < this.values.length && this.values[rightIndex] < this.values[index]) {
        return false;
      }
    }
    return true;
  }
}
