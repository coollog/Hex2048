// Iterable Priority Queue attaches priorities to data.
class PriorityQueue {
  // Create a PriorityQueue with a Map from priorities to data.
  constructor(map) {
    this._heap = [null];
    
    if (map) {
      let priority, data;
      for ([priority, data] of map) {
        this.push(priority, data);
      }
    }
  }
  
  // Push 'data' into the queue with 'priority'.
  push(priority, data) {
    const node = new PriorityQueue.Node(priority, data);
    this._bubble(this._heap.push(node) - 1);
  }
  
  // Pop the data with highest 'priority', or null if there is nothing left.
  pop() {
    if (this._heap.length == 1) {
      return null;
    }
    const top = this._heap[1].data;
    const last = this._heap.pop();
    if (this._heap.length > 1) {
      this._heap[1] = last;
      this._sink(1);
    }
    return top;
  }
  
  // Returns a cloned copy of the priority queue. Note that nodes are cloned by
  // reference (not a deep clone).
  clone() {
    const clone = new PriorityQueue();
    clone._heap = this._heap.slice();
    return clone;
  }
  
  [Symbol.iterator]() {
    const clone = this.clone();
    
    return {
      next() {
        const data = clone.pop();
        if (data === null) {
          return { done: true };
        }
        return { value: data, done: false };
      }
    };
  }
  
  // Bubbles node i up the binary tree based on priority until heap conditions
  // are restored.
  _bubble(i) {
    while (i > 1) { 
      const parentIndex = i >> 1; // floor(i/2)
      
      // Don't bubble if equal (maintains insertion order).
      if (!this._isHigherPriority(i, parentIndex)) break;
      
      this._swap(i, parentIndex);
      i = parentIndex;
    }
  }
  
  // Does the opposite of the '_bubble'.
  _sink(i) {
    while (i * 2 + 1 < this._heap.length) {
      // If equal, left bubbles (maintains insertion order).
      const leftChildIndex = i * 2;
      const rightChildIndex = i * 2 + 1;
      const leftHigher = 
          !this._isHigherPriority(rightChildIndex, leftChildIndex);
      const childIndex = leftHigher ? leftChildIndex : rightChildIndex;
      
      // If equal, sink happens (maintains insertion order).
      if (this._isHigherPriority(i, childIndex)) break;
      
      this._swap(i, childIndex);
      i = childIndex;
    }
  }
  
  // Swaps the addresses of 2 nodes.
  _swap(i, j) {
    const temp = this._heap[i];
    this._heap[i] = this._heap[j];
    this._heap[j] = temp;
  }
      
  // Returns true if node i is higher priority than j.
  _isHigherPriority(i, j) {
    return this._heap[i].priority < this._heap[j].priority;
  }
}

// DDO for a priority queue node.
PriorityQueue.Node = class {
  constructor(priority, data) {
    this.priority = priority;
    this.data = data;
  }
};
