export class StackArray {
  constructor(capacity = 10, initialValues = []) {
    this.capacity = capacity;
    this.items = [];
    initialValues.forEach((value) => this.push(value));
  }

  push(value) {
    if (this.isFull()) return false;
    this.items.push(value);
    return true;
  }

  pop() {
    if (this.isEmpty()) return null;
    return this.items.pop();
  }

  peek() {
    if (this.isEmpty()) return null;
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  isFull() {
    return this.items.length >= this.capacity;
  }

  size() {
    return this.items.length;
  }

  clear() {
    this.items = [];
  }

  toArray() {
    return [...this.items];
  }
}

export class StackLinkedList {
  constructor(initialValues = []) {
    this.top = null;
    this.size = 0;
    initialValues.forEach((value) => this.push(value));
  }

  push(value) {
    const node = { value, next: this.top };
    this.top = node;
    this.size += 1;
    return true;
  }

  pop() {
    if (!this.top) return null;
    const value = this.top.value;
    this.top = this.top.next;
    this.size -= 1;
    return value;
  }

  peek() {
    if (!this.top) return null;
    return this.top.value;
  }

  isEmpty() {
    return this.size === 0;
  }

  sizeValue() {
    return this.size;
  }

  clear() {
    this.top = null;
    this.size = 0;
  }

  toArray() {
    const values = [];
    let current = this.top;
    while (current) {
      values.push(current.value);
      current = current.next;
    }
    return values;
  }
}
