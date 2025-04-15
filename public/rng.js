/**
 * RNG (Random Number Generator) class using a Linear Congruential Generator (LCG).
 */
export class RNG {
  /**
   * Creates an instance of RNG.
   * @param {string|number} seed - The seed for the RNG. Can be a string or a number.
   */
  constructor(seed) {
    // LCG using GCC's constants
    this.m = 0x80000000; // 2**31
    this.a = 1103515245;
    this.c = 12345;

    if (typeof seed === "string") {
      this.state = this.hashString(seed) % this.m;
    } else {
      this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
    }
  }

  /**
   * Hashes a string to produce a numeric seed.
   * @param {string} str - The input string to hash.
   * @returns {number} - A hashed numeric value.
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % this.m;
    }
    return hash;
  }

  /**
   * Generates the next integer in the sequence.
   * @returns {number} - The next integer.
   */
  nextInt() {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state;
  }

  /**
   * Generates the next float in the range [0, 1].
   * @returns {number} - A float between 0 and 1.
   */
  nextFloat() {
    return this.nextInt() / (this.m - 1);
  }

  /**
   * Generates a random integer in the specified range [start, end).
   * @param {number} start - The inclusive start of the range.
   * @param {number} end - The exclusive end of the range.
   * @returns {number} - A random integer within the range.
   */
  nextRange(start, end) {
    const rangeSize = end - start;
    const randomUnder1 = this.nextInt() / this.m;
    return start + Math.floor(randomUnder1 * rangeSize);
  }

  /**
   * Chooses a random element from an array.
   * @param {Array} array - The array to choose from.
   * @returns {*} - A random element from the array.
   */
  choice(array) {
    return array[this.nextRange(0, array.length)];
  }
}
