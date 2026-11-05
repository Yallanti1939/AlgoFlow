import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SinglyLinkedList, DoublyLinkedList, CircularLinkedList } from "../src/data-structures/linkedLists.js";
import { StackArray, StackLinkedList } from "../src/data-structures/stacks.js";
import { SimpleQueue, CircularQueue, PriorityQueue, Deque, QueueUsingStacks } from "../src/data-structures/queues.js";
import { HashTable } from "../src/data-structures/hashing.js";
import { AnimationEngine } from "../src/utils/animationEngine.js";
import { stackApplications } from "../src/data/learningModules.js";

describe("Linked Lists", () => {
  it("supports singly linked list insert, delete, search and reverse", () => {
    const list = new SinglyLinkedList([10, 20]);
    list.insertAtBeginning(5);
    list.insertAtEnd(30);
    list.insertAtPosition(15, 2);

    expect(list.toArray()).toEqual([5, 10, 15, 20, 30]);
    expect(list.search(15)).toMatchObject({ index: 2 });
    expect(list.deleteFromBeginning()).toBe(5);
    expect(list.deleteAtPosition(2)).toBe(20);
    expect(list.deleteFromEnd()).toBe(30);
    expect(list.reverse()).toEqual([15, 10]);
    expect(list.getMiddle()).toBe(15);
    expect(list.count()).toBe(2);
  });

  it("handles empty and single-node singly list behavior", () => {
    const list = new SinglyLinkedList();
    expect(list.toArray()).toEqual([]);
    expect(list.search(7)).toBeNull();
    expect(list.deleteFromBeginning()).toBeNull();
    expect(list.deleteFromEnd()).toBeNull();
    list.insertAtBeginning(42);
    expect(list.toArray()).toEqual([42]);
    expect(list.getMiddle()).toBe(42);
    expect(list.reverse()).toEqual([42]);
  });

  it("supports doubly linked list insertions and deletions", () => {
    const list = new DoublyLinkedList([1, 3]);
    list.insertAtBeginning(0);
    list.insertAtPosition(2, 2);
    expect(list.toArray().map((item) => item.value)).toEqual([0, 1, 2, 3]);
    expect(list.deleteFromBeginning()).toBe(0);
    expect(list.deleteAtPosition(1)).toBe(2);
    expect(list.deleteFromEnd()).toBe(3);
    expect(list.toArray().map((item) => item.value)).toEqual([1]);
    expect(list.reverse()).toHaveLength(1);
  });

  it("supports circular linked list insertions and traversal", () => {
    const list = new CircularLinkedList([10, 20]);
    list.insertAtBeginning(5);
    list.insertAtEnd(30);
    expect(list.toArray()).toEqual([5, 10, 20, 30]);
    expect(list.deleteFromBeginning()).toBe(5);
    expect(list.deleteAtPosition(1)).toBe(20);
    expect(list.search(30)).toMatchObject({ index: 1 });
    expect(list.reverse()).toEqual([30, 10]);
  });
});

describe("Stacks", () => {
  it("handles array stack operations and underflow", () => {
    const stack = new StackArray(3);
    expect(stack.isEmpty()).toBe(true);
    expect(stack.push(10)).toBe(true);
    expect(stack.push(20)).toBe(true);
    expect(stack.push(30)).toBe(true);
    expect(stack.push(40)).toBe(false);
    expect(stack.peek()).toBe(30);
    expect(stack.pop()).toBe(30);
    expect(stack.pop()).toBe(20);
    expect(stack.pop()).toBe(10);
    expect(stack.pop()).toBeNull();
  });

  it("handles linked-list stack operations", () => {
    const stack = new StackLinkedList([1, 2, 3]);
    expect(stack.peek()).toBe(3);
    expect(stack.pop()).toBe(3);
    expect(stack.toArray()).toEqual([2, 1]);
    stack.clear();
    expect(stack.isEmpty()).toBe(true);
    expect(stack.peek()).toBeNull();
  });

  it("runs stack application demos", () => {
    const balanced = stackApplications.find((app) => app.id === "balanced-parentheses");
    expect(balanced.runner("([{}])").ok).toBe(true);
    expect(balanced.runner("([)]").ok).toBe(false);

    const postfix = stackApplications.find((app) => app.id === "postfix-evaluation");
    expect(postfix.runner("2 3 4 * +").result).toBe("14");

    const infix = stackApplications.find((app) => app.id === "infix-to-postfix");
    expect(infix.runner("A+B*C-D").result).toBe("A B C * + D -");

    const reverse = stackApplications.find((app) => app.id === "reverse-string");
    expect(reverse.runner("ALGORITHM").result).toBe("MHTIROGLA");
  });
});

describe("Queues", () => {
  it("handles simple queue behavior", () => {
    const queue = new SimpleQueue(3, [1, 2]);
    expect(queue.enqueue(3)).toBe(true);
    expect(queue.enqueue(4)).toBe(false);
    expect(queue.dequeue()).toBe(1);
    expect(queue.front()).toBe(2);
    expect(queue.rear()).toBe(3);
  });

  it("handles circular queue wraparound and overflow", () => {
    const queue = new CircularQueue(3, [10, 20]);
    expect(queue.enqueue(30)).toBe(true);
    expect(queue.enqueue(40)).toBe(false);
    expect(queue.dequeue()).toBe(10);
    expect(queue.enqueue(40)).toBe(true);
    expect(queue.toArray()).toEqual([20, 30, 40]);
  });

  it("handles priority queue and deque behavior", () => {
    const prio = new PriorityQueue([{ value: 10, priority: 2 }, { value: 20, priority: 1 }, { value: 30, priority: 3 }]);
    prio.enqueue(40, 0);
    expect(prio.dequeue()).toBe(40);

    const deque = new Deque([1, 2, 3]);
    deque.pushFront(0);
    deque.pushBack(4);
    expect(deque.front()).toBe(0);
    expect(deque.rear()).toBe(4);
    expect(deque.popFront()).toBe(0);
    expect(deque.popBack()).toBe(4);
  });

  it("implements queue using stacks", () => {
    const queue = new QueueUsingStacks([1, 2, 3]);
    expect(queue.front()).toBe(1);
    expect(queue.dequeue()).toBe(1);
    expect(queue.enqueue(4)).toBe(true);
    expect(queue.toArray()).toEqual([2, 3, 4]);
  });
});

describe("Hashing", () => {
  it("supports insert, search, update and delete across strategies", () => {
    const linear = new HashTable(7, "linear");
    linear.insert("A", 1);
    linear.insert("B", 2);
    expect(linear.search("A")).toBe(1);
    expect(linear.insert("A", 9)).toBe(true);
    expect(linear.search("A")).toBe(9);
    expect(linear.delete("B")).toBe(true);
    expect(linear.search("B")).toBeNull();

    const quadratic = new HashTable(7, "quadratic");
    quadratic.insert("A", 1);
    quadratic.insert("B", 2);
    expect(quadratic.search("B")).toBe(2);

    const doubleHash = new HashTable(7, "double");
    doubleHash.insert("AB", 7);
    doubleHash.insert("BA", 9);
    expect(doubleHash.search("AB")).toBe(7);

    const chaining = new HashTable(7, "separate-chaining");
    chaining.insert("one", 1);
    chaining.insert("neo", 2);
    expect(chaining.search("neo")).toBe(2);
    expect(chaining.delete("one")).toBe(true);
  });

  it("handles collision resolution and deletion after collision", () => {
    const table = new HashTable(7, "linear");
    table.insert("A", 1);
    table.insert("B", 2);
    table.insert("C", 3);
    expect(table.search("C")).toBe(3);
    expect(table.delete("B")).toBe(true);
    expect(table.search("B")).toBeNull();

    const chainTable = new HashTable(7, "separate-chaining");
    chainTable.insert("A", 1);
    chainTable.insert("B", 2);
    chainTable.insert("A", 9);
    expect(chainTable.search("A")).toBe(9);
  });
});

describe("Animation engine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("supports play, pause, resume, step, reset and speed changes", () => {
    const steps = [{ label: "start" }, { label: "middle" }, { label: "end" }];
    const onChange = vi.fn();
    const engine = new AnimationEngine({ steps, speed: 100, onChange });

    engine.play();
    expect(engine.current()).toMatchObject({ label: "start" });
    vi.advanceTimersByTime(100);
    expect(engine.current()).toMatchObject({ label: "middle" });

    engine.pause();
    engine.stepForward();
    expect(engine.current()).toMatchObject({ label: "end" });

    engine.stepBackward();
    expect(engine.current()).toMatchObject({ label: "middle" });

    engine.reset();
    expect(engine.current()).toMatchObject({ label: "start" });

    engine.setSpeed(50);
    expect(engine.speed).toBe(50);

    engine.resume();
    vi.advanceTimersByTime(50);
    expect(engine.current()).toMatchObject({ label: "middle" });
  });

  it("handles empty and completed sequences", () => {
    const engine = new AnimationEngine({ steps: [], speed: 50 });
    expect(() => engine.play()).not.toThrow();
    expect(engine.current()).toBeNull();

    const completeEngine = new AnimationEngine({ steps: [{ label: "only" }], speed: 50 });
    completeEngine.play();
    vi.advanceTimersByTime(50);
    expect(completeEngine.isPlaying).toBe(false);
    expect(completeEngine.current()).toMatchObject({ label: "only" });
  });

  it("cleans up timers on reset and when steps change", () => {
    const engine = new AnimationEngine({ steps: [{ label: "one" }, { label: "two" }], speed: 50 });
    engine.play();
    engine.reset();
    expect(engine.timer).toBeNull();

    engine.setSteps([{ label: "a" }, { label: "b" }]);
    expect(engine.index).toBe(0);
    expect(engine.current()).toMatchObject({ label: "a" });
  });
});
