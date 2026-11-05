export const isPalindrome = (value) => {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned === cleaned.split("").reverse().join("");
};

export const isAnagram = (first, second) => {
  const left = first.replace(/\s+/g, "").toLowerCase();
  const right = second.replace(/\s+/g, "").toLowerCase();

  if (left.length !== right.length) return false;

  const frequency = {};

  for (const char of left) {
    frequency[char] = (frequency[char] ?? 0) + 1;
  }

  for (const char of right) {
    if (!frequency[char]) return false;
    frequency[char] -= 1;
  }

  return true;
};
