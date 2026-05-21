function ArrayImplementation({ onBack }) {
	return (
		<div className="array-shell">
			<div className="array-card">
				<div className="page-header">
					<div>
						<div className="array-title">Stack Using Array</div>
						<div className="array-meta">Fixed-size, index-based stack implementation</div>
					</div>
					<button className="back-btn" type="button" onClick={onBack}>
						Back to Stack
					</button>
				</div>

				<div className="info-grid">
					<div className="info-card">
						<h3>What is Stack Implementation Using Array?</h3>
						<p>
							A stack can be stored in a fixed-size array with a single pointer (top) that tracks the last
							inserted element. Push and pop adjust the top index to maintain LIFO order.
						</p>
					</div>
					<div className="info-card">
						<h3>Use Cases</h3>
						<p>
							Array-based stacks are compact and fast for bounded storage, such as expression evaluation or
							backtracking.
						</p>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Algorithmic Steps</div>
					<div className="info-grid">
						<div className="info-card">
							<h3>Stack Basic Operations</h3>
							<ol className="steps-list">
								<li>Push: check overflow, then increment top and store the item.</li>
								<li>Pop: check underflow, then read top and decrement it.</li>
								<li>Peek: return the element at top without changing it.</li>
							</ol>
						</div>
						<div className="info-card">
							<h3>Stack Helper Operations</h3>
							<ol className="steps-list">
								<li>IsEmpty: top equals -1.</li>
								<li>IsFull: top equals capacity - 1.</li>
								<li>Size: top + 1 gives the number of items.</li>
							</ol>
						</div>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Time Complexity</div>
					<div className="complexity-graph">
						<div className="graph-bar active">
							<span>Push O(1)</span>
						</div>
						<div className="graph-bar active">
							<span>Pop O(1)</span>
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
						<li>Contiguous memory layout for cache-friendly access.</li>
						<li>Overflow/underflow checks are mandatory.</li>
						<li>Best for known or bounded stack sizes.</li>
					</ul>
				</div>

				<div className="section-block">
					<div className="section-title">C++ Code for Stack Implementation Using Array</div>
					<pre className="code-block">
						<code>{`class Stack {
private:
    int top;
    int capacity;
    int* data;

public:
    Stack(int cap) : top(-1), capacity(cap), data(new int[cap]) {}

    ~Stack() {
        delete[] data;
    }

    bool isEmpty() const {
        return top == -1;
    }

    bool isFull() const {
        return top == capacity - 1;
    }

    int size() const {
        return top + 1;
    }

    void push(int value) {
        if (isFull()) {
            throw std::runtime_error("Stack overflow");
        }
        data[++top] = value;
    }

    int pop() {
        if (isEmpty()) {
            throw std::runtime_error("Stack underflow");
        }
        return data[top--];
    }

    int peek() const {
        if (isEmpty()) {
            throw std::runtime_error("Stack is empty");
        }
        return data[top];
    }
};`}</code>
					</pre>
				</div>
			</div>
		</div>
	);
}

export default ArrayImplementation;
