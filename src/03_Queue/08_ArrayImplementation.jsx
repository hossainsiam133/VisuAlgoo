function ArrayImplementation({ onBack }) {
	return (
		<div className="array-shell">
			<div className="array-card">
				<div className="page-header">
					<div>
						<div className="array-title">Queue Using Array</div>
						<div className="array-meta">Fixed-size circular queue implementation</div>
					</div>
					<button className="back-btn" type="button" onClick={onBack}>
						Back to Queue
					</button>
				</div>

				<div className="info-grid">
					<div className="info-card">
						<h3>What is Queue Implementation Using Array?</h3>
						<p>
							A queue can be stored in a fixed-size array using two indices (front and rear). A circular
							approach lets indices wrap around to reuse free slots efficiently.
						</p>
					</div>
					<div className="info-card">
						<h3>Use Cases</h3>
						<p>
							Array-based queues are ideal for bounded buffers, scheduling, and streaming pipelines.
						</p>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Algorithmic Steps</div>
					<div className="info-grid">
						<div className="info-card">
							<h3>Queue Basic Operations</h3>
							<ol className="steps-list">
								<li>Enqueue: check overflow, move rear, store the item.</li>
								<li>Dequeue: check underflow, read front, move front.</li>
								<li>Peek: return element at front without removing it.</li>
							</ol>
						</div>
						<div className="info-card">
							<h3>Queue Helper Operations</h3>
							<ol className="steps-list">
								<li>IsEmpty: size equals 0.</li>
								<li>IsFull: size equals capacity.</li>
								<li>Size: track with a counter to avoid ambiguity.</li>
							</ol>
						</div>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Time Complexity</div>
					<div className="complexity-graph">
						<div className="graph-bar active">
							<span>Enqueue O(1)</span>
						</div>
						<div className="graph-bar active">
							<span>Dequeue O(1)</span>
						</div>
						<div className="graph-bar active">
							<span>Peek O(1)</span>
						</div>
						<div className="graph-bar">
							<span>Search O(n)</span>
						</div>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Key Characteristics</div>
					<ul className="steps-list">
						<li>Fixed capacity unless resized manually.</li>
						<li>Front and rear wrap using modulo arithmetic.</li>
						<li>Maintains FIFO order with constant-time operations.</li>
						<li>Best for bounded queues and buffer management.</li>
					</ul>
				</div>

				<div className="section-block">
					<div className="section-title">C++ Code for Queue Implementation Using Array</div>
					<pre className="code-block">
						<code>{`class Queue {
private:
    int* data;
    int capacity;
    int front;
    int rear;
    int size;

public:
    Queue(int cap) : data(new int[cap]), capacity(cap), front(0), rear(-1), size(0) {}

    ~Queue() {
        delete[] data;
    }

    bool isEmpty() const {
        return size == 0;
    }

    bool isFull() const {
        return size == capacity;
    }

    int getSize() const {
        return size;
    }

    void enqueue(int value) {
        if (isFull()) {
            throw std::runtime_error("Queue overflow");
        }
        rear = (rear + 1) % capacity;
        data[rear] = value;
        size++;
    }

    int dequeue() {
        if (isEmpty()) {
            throw std::runtime_error("Queue underflow");
        }
        int value = data[front];
        front = (front + 1) % capacity;
        size--;
        return value;
    }

    int peek() const {
        if (isEmpty()) {
            throw std::runtime_error("Queue is empty");
        }
        return data[front];
    }
};`}</code>
					</pre>
				</div>
			</div>
		</div>
	);
}

export default ArrayImplementation;