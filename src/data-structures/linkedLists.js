export class SinglyLinkedList {
  constructor(initialValues = []) {
    this.head = null;
    this.tail = null;
    this.size = 0;

    initialValues.forEach((value) => this.insertAtEnd(value));
  }

  insertAtBeginning(value) {
    const node = { value, next: this.head };
    this.head = node;
    if (!this.tail) this.tail = node;
    this.size += 1;
    return node;
  }

  insertAtEnd(value) {
    const node = { value, next: null };
    if (!this.head) {
      this.head = node;
      this.tail = node;
      this.size = 1;
      return node;
    }

    this.tail.next = node;
    this.tail = node;
    this.size += 1;
    return node;
  }

  insertAtPosition(value, index) {
    if (index <= 0) return this.insertAtBeginning(value);
    if (index >= this.size) return this.insertAtEnd(value);

    let current = this.head;
    for (let i = 0; i < index - 1; i += 1) {
      current = current.next;
    }

    const node = { value, next: current.next };
    current.next = node;
    this.size += 1;
    return node;
  }

  deleteFromBeginning() {
    if (!this.head) return null;
    const value = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.size = Math.max(this.size - 1, 0);
    return value;
  }

  deleteFromEnd() {
    if (!this.head) return null;
    if (this.size === 1) {
      const value = this.head.value;
      this.head = null;
      this.tail = null;
      this.size = 0;
      return value;
    }

    let current = this.head;
    while (current.next !== this.tail) {
      current = current.next;
    }

    const value = this.tail.value;
    current.next = null;
    this.tail = current;
    this.size -= 1;
    return value;
  }

  deleteAtPosition(index) {
    if (index < 0 || index >= this.size) return null;
    if (index === 0) return this.deleteFromBeginning();

    let current = this.head;
    for (let i = 0; i < index - 1; i += 1) {
      current = current.next;
    }

    const value = current.next.value;
    current.next = current.next.next;

    if (index === this.size - 1) {
      this.tail = current;
    }

    this.size -= 1;
    return value;
  }

  search(value) {
    let current = this.head;
    let index = 0;

    while (current) {
      if (current.value === value) return { index, node: current };
      current = current.next;
      index += 1;
    }

    return null;
  }

  update(value, newValue) {
    const result = this.search(value);
    if (!result) return false;
    result.node.value = newValue;
    return true;
  }

  traverse() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  reverse() {
    let previous = null;
    let current = this.head;

    while (current) {
      const next = current.next;
      current.next = previous;
      previous = current;
      current = next;
    }

    const oldHead = this.head;
    this.head = previous;
    this.tail = oldHead;
    return this.traverse();
  }

  getMiddle() {
    if (!this.head) return null;
    let slow = this.head;
    let fast = this.head;

    while (fast && fast.next && fast.next.next) {
      slow = slow.next;
      fast = fast.next.next;
    }

    return slow.value;
  }

  hasCycle() {
    if (!this.head) return false;
    let slow = this.head;
    let fast = this.head;

    while (fast && fast.next) {
      slow = slow.next;
      fast = fast.next.next;
      if (slow === fast) return true;
    }

    return false;
  }

  count() {
    return this.size;
  }

  clear() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  toArray() {
    return this.traverse();
  }
}

export class DoublyLinkedList {
  constructor(initialValues = []) {
    this.head = null;
    this.tail = null;
    this.size = 0;

    initialValues.forEach((value) => this.insertAtEnd(value));
  }

  insertAtBeginning(value) {
    const node = { value, prev: null, next: this.head };
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
    this.size += 1;
    return node;
  }

  insertAtEnd(value) {
    const node = { value, prev: this.tail, next: null };
    if (!this.head) {
      this.head = node;
      this.tail = node;
      this.size = 1;
      return node;
    }

    this.tail.next = node;
    this.tail = node;
    this.size += 1;
    return node;
  }

  insertAtPosition(value, index) {
    if (index <= 0) return this.insertAtBeginning(value);
    if (index >= this.size) return this.insertAtEnd(value);

    let current = this.head;
    for (let i = 0; i < index; i += 1) {
      current = current.next;
    }

    const node = { value, prev: current.prev, next: current };
    current.prev.next = node;
    current.prev = node;
    this.size += 1;
    return node;
  }

  deleteFromBeginning() {
    if (!this.head) return null;
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head) this.head.prev = null;
    else this.tail = null;
    this.size = Math.max(this.size - 1, 0);
    return value;
  }

  deleteFromEnd() {
    if (!this.tail) return null;
    const value = this.tail.value;
    this.tail = this.tail.prev;
    if (this.tail) this.tail.next = null;
    else this.head = null;
    this.size = Math.max(this.size - 1, 0);
    return value;
  }

  deleteAtPosition(index) {
    if (index < 0 || index >= this.size) return null;
    if (index === 0) return this.deleteFromBeginning();

    let current = this.head;
    for (let i = 0; i < index; i += 1) {
      current = current.next;
    }

    const value = current.value;
    const previous = current.prev;
    previous.next = current.next;
    if (current.next) current.next.prev = previous;
    else this.tail = previous;

    this.size -= 1;
    return value;
  }

  search(value) {
    let current = this.head;
    let index = 0;
    while (current) {
      if (current.value === value) return { index, node: current };
      current = current.next;
      index += 1;
    }
    return null;
  }

  update(value, newValue) {
    const result = this.search(value);
    if (!result) return false;
    result.node.value = newValue;
    return true;
  }

  traverse() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push({ value: current.value, prev: current.prev ? current.prev.value : null, next: current.next ? current.next.value : null });
      current = current.next;
    }
    return result;
  }

  reverse() {
    let current = this.head;
    while (current) {
      [current.next, current.prev] = [current.prev, current.next];
      current = current.prev;
    }
    [this.head, this.tail] = [this.tail, this.head];
    return this.traverse();
  }

  getMiddle() {
    if (!this.head) return null;
    let slow = this.head;
    let fast = this.head;
    while (fast && fast.next) {
      slow = slow.next;
      fast = fast.next.next;
    }
    return slow.value;
  }

  clear() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  toArray() {
    return this.traverse();
  }
}

export class CircularLinkedList {
  constructor(initialValues = []) {
    this.head = null;
    this.tail = null;
    this.size = 0;

    initialValues.forEach((value) => this.insertAtEnd(value));
  }

  insertAtBeginning(value) {
    const node = { value, next: this.head };
    if (!this.head) {
      this.head = node;
      this.tail = node;
      this.tail.next = this.head;
      this.size = 1;
      return node;
    }

    const oldHead = this.head;
    this.head = node;
    this.tail.next = this.head;
    this.head.next = oldHead;
    this.size += 1;
    return node;
  }

  insertAtEnd(value) {
    const node = { value, next: null };
    if (!this.head) {
      this.head = node;
      this.tail = node;
      this.tail.next = this.head;
      this.size = 1;
      return node;
    }

    this.tail.next = node;
    node.next = this.head;
    this.tail = node;
    this.size += 1;
    return node;
  }

  insertAtPosition(value, index) {
    if (index <= 0) return this.insertAtBeginning(value);
    if (index >= this.size) return this.insertAtEnd(value);

    let current = this.head;
    for (let i = 0; i < index - 1; i += 1) {
      current = current.next;
    }

    const node = { value, next: current.next };
    current.next = node;
    this.size += 1;
    return node;
  }

  deleteFromBeginning() {
    if (!this.head) return null;
    if (this.size === 1) {
      const value = this.head.value;
      this.head = null;
      this.tail = null;
      this.size = 0;
      return value;
    }

    const value = this.head.value;
    this.head = this.head.next;
    this.tail.next = this.head;
    this.size -= 1;
    return value;
  }

  deleteFromEnd() {
    if (!this.head) return null;
    if (this.size === 1) {
      const value = this.head.value;
      this.head = null;
      this.tail = null;
      this.size = 0;
      return value;
    }

    let current = this.head;
    while (current.next !== this.tail) {
      current = current.next;
    }

    const value = this.tail.value;
    current.next = this.head;
    this.tail = current;
    this.size -= 1;
    return value;
  }

  deleteAtPosition(index) {
    if (index < 0 || index >= this.size) return null;
    if (index === 0) return this.deleteFromBeginning();

    let current = this.head;
    for (let i = 0; i < index - 1; i += 1) {
      current = current.next;
    }

    const value = current.next.value;
    current.next = current.next.next;
    if (index === this.size - 1) this.tail = current;
    this.size -= 1;
    return value;
  }

  search(value) {
    if (!this.head) return null;
    let current = this.head;
    let index = 0;
    do {
      if (current.value === value) return { index, node: current };
      current = current.next;
      index += 1;
    } while (current !== this.head);
    return null;
  }

  update(value, newValue) {
    const result = this.search(value);
    if (!result) return false;
    result.node.value = newValue;
    return true;
  }

  traverse() {
    if (!this.head) return [];
    const result = [];
    let current = this.head;
    do {
      result.push(current.value);
      current = current.next;
    } while (current !== this.head);
    return result;
  }

  reverse() {
    if (this.size < 2) return this.traverse();

    const values = this.traverse();
    this.clear();
    values.reverse().forEach((value) => this.insertAtEnd(value));
    return this.traverse();
  }

  getMiddle() {
    if (!this.head) return null;

    const values = this.traverse();
    if (values.length === 0) return null;
    const middleIndex = Math.floor(values.length / 2);
    return values[middleIndex];
  }

  hasCycle() {
    return this.size > 0;
  }

  count() {
    return this.size;
  }

  clear() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  toArray() {
    return this.traverse();
  }
}
