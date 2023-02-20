describe("CircularQueue", function () {
  var queue;

  beforeEach(function () {
    queue = new Queue(5);
  });

  it("should replace elements in fifo order", function () {
    queue.enQueue(1);
    queue.enQueue(2);
    queue.enQueue(3);
    queue.enQueue(4);
    queue.enQueue(5);

    expect(queue.getElementIndex(6)).toBe(-1);

    queue.enQueue(6);

    expect(queue.getElementIndex(6)).toBe(0);
    expect(queue.getElementIndex(1)).toBe(-1);
  });
});
