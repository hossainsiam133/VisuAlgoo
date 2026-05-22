import { useMemo, useRef, useState } from 'react';

const DEFAULT_ITEMS = [
	{ id: 1, value: 18, priority: 1 },
	{ id: 2, value: 7, priority: 3 },
	{ id: 3, value: 12, priority: 2 }
];

function PriorityQueue({ onBack }) {
	const idCounterRef = useRef(DEFAULT_ITEMS.length + 1);
	const initialQueueRef = useRef(sortQueue(DEFAULT_ITEMS));
	const [inputText, setInputText] = useState('9');
	const [priorityText, setPriorityText] = useState('2');
	const [queue, setQueue] = useState(initialQueueRef.current);
	const [activeIndex, setActiveIndex] = useState(null);
	const [peekFront, setPeekFront] = useState(queue.length ? queue[0] : null);
	const [peekRear, setPeekRear] = useState(queue.length ? queue[queue.length - 1] : null);
	const [status, setStatus] = useState('Add values with priorities. Lower priority number = higher priority.');

	const frontIndex = queue.length ? 0 : null;
	const rearIndex = queue.length ? queue.length - 1 : null;
	const queueView = useMemo(
		() => queue.map((item, index) => ({ ...item, index })),
		[queue]
	);

	const handleEnqueue = () => {
		const value = parseNumber(inputText);
		const priority = parseNumber(priorityText);
		if (value === null || priority === null) {
			setStatus('Enter valid numbers for value and priority.');
			return;
		}
		const id = idCounterRef.current;
		idCounterRef.current += 1;
		setQueue((prev) => {
			const next = sortQueue([...prev, { id, value, priority }]);
			const nextIndex = next.findIndex((item) => item.id === id);
			setActiveIndex(nextIndex);
			setPeekFront(next[0] || null);
			setPeekRear(next.length ? next[next.length - 1] : null);
			return next;
		});
		setStatus(`Enqueued ${value} with priority ${priority}.`);
	};

	const handleDequeue = () => {
		setQueue((prev) => {
			if (!prev.length) {
				setStatus('Priority queue is empty. Nothing to dequeue.');
				setActiveIndex(null);
				setPeekFront(null);
				setPeekRear(null);
				return prev;
			}
			const removed = prev[0];
			const next = prev.slice(1);
			setStatus(`Dequeued ${removed.value} (priority ${removed.priority}).`);
			setActiveIndex(next.length ? 0 : null);
			setPeekFront(next.length ? next[0] : null);
			setPeekRear(next.length ? next[next.length - 1] : null);
			return next;
		});
	};

	const handlePeekFront = () => {
		if (!queue.length) {
			setStatus('Priority queue is empty.');
			setActiveIndex(null);
			setPeekFront(null);
			setPeekRear(null);
			return;
		}
		setActiveIndex(0);
		setPeekFront(queue[0]);
		setStatus(`Front is ${queue[0].value} (priority ${queue[0].priority}).`);
	};

	const handlePeekRear = () => {
		if (!queue.length) {
			setStatus('Priority queue is empty.');
			setActiveIndex(null);
			setPeekFront(null);
			setPeekRear(null);
			return;
		}
		const lastIndex = queue.length - 1;
		setActiveIndex(lastIndex);
		setPeekRear(queue[lastIndex]);
		setStatus(`Rear is ${queue[lastIndex].value} (priority ${queue[lastIndex].priority}).`);
	};

	const handleReset = () => {
		const baseQueue = sortQueue(DEFAULT_ITEMS);
		initialQueueRef.current = baseQueue;
		idCounterRef.current = baseQueue.length + 1;
		setQueue(baseQueue);
		setActiveIndex(null);
		setPeekFront(baseQueue.length ? baseQueue[0] : null);
		setPeekRear(baseQueue.length ? baseQueue[baseQueue.length - 1] : null);
		setStatus('Priority queue reset.');
	};

	return (
		<div className="array-shell">
			<div className="array-card">
				<div className="page-header">
					<div>
						<div className="array-title">Priority Queue</div>
						<div className="array-meta">Lower priority numbers are served first</div>
					</div>
					<button className="back-btn" type="button" onClick={onBack}>
						Back to Queue
					</button>
				</div>

				<div className="info-grid">
					<div className="info-card">
						<h3>Priority Rule</h3>
						<p>Items are ordered by priority. Ties keep their arrival order.</p>
					</div>
					<div className="info-card">
						<h3>Operations</h3>
						<p>Enqueue adds with a priority, dequeue removes the highest priority item.</p>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Live Visualization</div>
					<div className="array-controls">
						<div className="control-field">
							<label>Value</label>
							<input
								type="number"
								value={inputText}
								onChange={(event) => setInputText(event.target.value)}
								placeholder="e.g. 15"
							/>
						</div>
						<div className="control-field">
							<label>Priority</label>
							<input
								type="number"
								value={priorityText}
								onChange={(event) => setPriorityText(event.target.value)}
								placeholder="1"
							/>
						</div>
						<div className="control-field">
							<label>Front value</label>
							<input type="text" value={peekFront ? peekFront.value : '-'} readOnly />
						</div>
						<div className="control-field">
							<label>Rear value</label>
							<input type="text" value={peekRear ? peekRear.value : '-'} readOnly />
						</div>
					</div>
					<div className="viz-controls">
						<button className="array-btn" type="button" onClick={handleEnqueue}>
							Enqueue
						</button>
						<button className="array-btn" type="button" onClick={handleDequeue}>
							Dequeue
						</button>
						<button className="array-btn" type="button" onClick={handlePeekFront}>
							Peek Front
						</button>
						<button className="array-btn" type="button" onClick={handlePeekRear}>
							Peek Rear
						</button>
						<button className="array-btn" type="button" onClick={handleReset}>
							Reset
						</button>
					</div>
					<div className="array-status">{status}</div>
					<div className="stack-meta">
						<span>Size: {queue.length}</span>
						<span>Front index: {frontIndex ?? '-'}</span>
						<span>Rear index: {rearIndex ?? '-'}</span>
					</div>
					<div className="viz-array">
						{queueView.length ? (
							queueView.map(({ id, value, priority, index }) => (
								<div
									key={`${id}-${priority}`}
									className={`viz-cell ${index === activeIndex ? 'active' : ''} ${
										index === frontIndex ? 'top' : ''
									}`}
								>
									<div className="viz-value">{value}</div>
									<div className="stack-index">priority {priority}</div>
									<div className="stack-index">index {index}</div>
									{index === frontIndex && <div className="stack-index">front</div>}
									{index === rearIndex && <div className="stack-index">rear</div>}
								</div>
							))
						) : (
							<div className="stack-empty">Priority queue is empty.</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function sortQueue(items) {
	return [...items].sort((left, right) => {
		if (left.priority !== right.priority) {
			return left.priority - right.priority;
		}
		return left.id - right.id;
	});
}

function parseNumber(text) {
	const value = Number.parseInt(text, 10);
	return Number.isFinite(value) ? value : null;
}

export default PriorityQueue;