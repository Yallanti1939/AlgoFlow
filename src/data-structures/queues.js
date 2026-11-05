export class SimpleQueue {
  constructor(capacity = 10, initialValues = []) {
    this.capacity = capacity;
    this.items = [];
    initialValues.forEach((value) => this.enqueue(value));
  }

  enqueue(value) {
    if (this.isFull()) return false;
    this.items.push(value);
    return true;
  }

  dequeue() {
    if (this.isEmpty()) return null;
    return this.items.shift();
  }

  front() {
    if (this.isEmpty()) return null;
    return this.items[0];
  }

  rear() {
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

export class CircularQueue {
  constructor(capacity = 5, initialValues = []) {
    this.capacity = capacity;
    this.items = new Array(capacity).fill(null);
    this.front = 0;
    this.rear = -1;
    this.size = 0;
    initialValues.forEach((value) => this.enqueue(value));
  }

  enqueue(value) {
    if (this.isFull()) return false;
    this.rear = (this.rear + 1) % this.capacity;
    this.items[this.rear] = value;
    this.size += 1;
    return true;
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const value = this.items[this.front];
    this.items[this.front] = null;
    this.front = (this.front + 1) % this.capacity;
    this.size -= 1;
    return value;
  }

  frontValue() {
    if (this.isEmpty()) return null;
    return this.items[this.front];
  }

  rearValue() {
    if (this.isEmpty()) return null;
    return this.items[this.rear];
  }

  isEmpty() {
    return this.size === 0;
  }

  isFull() {
    return this.size >= this.capacity;
  }

  sizeValue() {
    return this.size;
  }

  clear() {
    this.items = new Array(this.capacity).fill(null);
    this.front = 0;
    this.rear = -1;
    this.size = 0;
  }

  toArray() {
    const values = [];
    for (let i = 0; i < this.size; i += 1) {
      values.push(this.items[(this.front + i) % this.capacity]);
    }
    return values;
  }
}

export class PriorityQueue {
  constructor(initialValues = []) {
    this.items = [];
    initialValues.forEach((entry) => this.enqueue(entry.value, entry.priority));
  }

  enqueue(value, priority = 0) {
    const item = { value, priority };
    this.items.push(item);
    this.items.sort((a, b) => a.priority - b.priority);
    return true;
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const item = this.items.shift();
    return item?.value ?? null;
  }

  peek() {
    if (this.isEmpty()) return null;
    return this.items[0]?.value ?? null;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  clear() {
    this.items = [];
  }

  toArray() {
    return this.items.map((item) => ({ value: item.value, priority: item.priority }));
  }
}

export class Deque {
  constructor(initialValues = []) {
    this.items = [];
    initialValues.forEach((value) => this.pushBack(value));
  }

  pushFront(value) {
    this.items.unshift(value);
    return true;
  }

  pushBack(value) {
    this.items.push(value);
    return true;
  }

  popFront() {
    if (this.isEmpty()) return null;
    return this.items.shift();
  }

  popBack() {
    if (this.isEmpty()) return null;
    return this.items.pop();
  }

  front() {
    return this.items[0] ?? null;
  }

  rear() {
    return this.items[this.items.length - 1] ?? null;
  }

  isEmpty() {
    return this.items.length === 0;
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

export class QueueUsingStacks {
  constructor(initialValues = []) {
    this.inbox = [];
    this.outbox = [];
    initialValues.forEach((value) => this.enqueue(value));
  }

  enqueue(value) {
    this.inbox.push(value);
    return true;
  }

  dequeue() {
    if (this.outbox.length === 0) {
      while (this.inbox.length > 0) {
        this.outbox.push(this.inbox.pop());
      }
    }
    if (this.outbox.length === 0) return null;
    return this.outbox.pop();
  }

  front() {
    if (this.outbox.length === 0) {
      while (this.inbox.length > 0) {
        this.outbox.push(this.inbox.pop());
      }
    }
    return this.outbox[this.outbox.length - 1] ?? null;
  }

  size() {
    return this.inbox.length + this.outbox.length;
  }

  isEmpty() {
    return this.size() === 0;
  }

  clear() {
    this.inbox = [];
    this.outbox = [];
  }

  toArray() {
    return [...this.outbox].reverse().concat([...this.inbox]);
  }
}
