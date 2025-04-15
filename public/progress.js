const STORAGE_KEY = "practice-generator-progress-v1";

export class Progress {
  constructor() {
    /**
     * @type {Object<number, number>}
     */
    this.progress = {};
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized) {
      for (const item of serialized.split(",")) {
        const [key, value] = item.split(":").map((v) => parseInt(v, 10));
        this.progress[key] = value;
      }
    }
  }

  /**
   *
   * @param {number} dayIndex
   * @param {number} exerciseIndex
   * @returns {boolean}
   */
  isDone(dayIndex, exerciseIndex) {
    const mask = 1 << exerciseIndex;
    return (this.progress[dayIndex] & mask) !== 0;
  }

  /**
   *
   * @param {number} dayIndex
   * @param {number} exerciseIndex
   * @param {boolean} done
   */
  markDone(dayIndex, exerciseIndex, done) {
    const mask = 1 << exerciseIndex;
    if (done) {
      this.progress[dayIndex] |= mask;
    } else {
      this.progress[dayIndex] &= ~mask;
    }
    this.saveProgress();
  }

  saveProgress() {
    const serialized = Object.entries(this.progress)
      .map(([key, value]) => `${key}:${value}`)
      .join(",");
    localStorage.setItem(STORAGE_KEY, serialized);
  }
}
