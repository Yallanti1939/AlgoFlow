export class HashTable {
  constructor(size = 11, strategy = "linear") {
    this.size = size;
    this.strategy = strategy;
    this.table = Array(size).fill(null);
  }

  hash(value) {
    let hashValue = 0;
    const text = String(value);
    for (let i = 0; i < text.length; i += 1) {
      hashValue = (hashValue * 31 + text.charCodeAt(i)) % this.size;
    }
    return hashValue;
  }

  secondaryHash(value) {
    return 1 + (this.hash(value) % (this.size - 1));
  }

  probeIndex(index, attempt) {
    switch (this.strategy) {
      case "linear":
        return (index + attempt) % this.size;
      case "quadratic":
        return (index + attempt * attempt) % this.size;
      case "double":
        return (index + attempt * this.secondaryHash(index)) % this.size;
      case "separate-chaining":
      default:
        return index;
    }
  }

  insert(key, value) {
    if (this.strategy === "separate-chaining") {
      const index = this.hash(key);
      if (!this.table[index]) this.table[index] = [];
      const existing = this.table[index].find((entry) => entry.key === key);
      if (existing) {
        existing.value = value;
        return true;
      }
      this.table[index].push({ key, value });
      return true;
    }

    let attempt = 0;
    let index = this.hash(key);

    while (attempt < this.size) {
      const probe = this.probeIndex(index, attempt);
      const bucket = this.table[probe];

      if (!bucket || bucket.key === key) {
        this.table[probe] = { key, value };
        return true;
      }
      attempt += 1;
    }

    return false;
  }

  search(key) {
    if (this.strategy === "separate-chaining") {
      const index = this.hash(key);
      const bucket = this.table[index] ?? [];
      const found = bucket.find((entry) => entry.key === key);
      return found ? found.value : null;
    }

    let attempt = 0;
    let index = this.hash(key);

    while (attempt < this.size) {
      const probe = this.probeIndex(index, attempt);
      const bucket = this.table[probe];
      if (!bucket) return null;
      if (bucket.key === key) return bucket.value;
      attempt += 1;
    }

    return null;
  }

  delete(key) {
    if (this.strategy === "separate-chaining") {
      const index = this.hash(key);
      const bucket = this.table[index] ?? [];
      const entryIndex = bucket.findIndex((entry) => entry.key === key);
      if (entryIndex >= 0) {
        bucket.splice(entryIndex, 1);
        return true;
      }
      return false;
    }

    let attempt = 0;
    let index = this.hash(key);

    while (attempt < this.size) {
      const probe = this.probeIndex(index, attempt);
      const bucket = this.table[probe];
      if (!bucket) return false;
      if (bucket.key === key) {
        this.table[probe] = null;
        return true;
      }
      attempt += 1;
    }

    return false;
  }

  clear() {
    this.table = Array(this.size).fill(null);
  }

  toDisplay() {
    return this.table.map((bucket, index) => ({
      index,
      bucket: Array.isArray(bucket) ? bucket : bucket ? [bucket] : [],
    }));
  }
}
