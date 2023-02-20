var Queue = function (maxSize) {
  this.reset = function () {
    this.head = -1;
    this.queue = [];
  };

  this.reset();
  this.maxSize = maxSize || Queue.MAX_SIZE;

  this.increment = function (number) {
    return (number + 1) % this.maxSize;
  };
};

Queue.MAX_SIZE = Math.pow(2, 53) - 1;

Queue.prototype.enQueue = function (record) {
  this.head = this.increment(this.head);
  this.queue[this.head] = record;
};

/**
 * @param record Record to look for
 * @returns Number Position of record in the queue otherwise -1
 */
Queue.prototype.getElementIndex = function (record) {
  return this.queue.indexOf(record);
};

Queue.prototype.print = function () {
  for (var i = 0; i <= this.head; i++) {
    console.log(this.queue[i]);
  }
};
