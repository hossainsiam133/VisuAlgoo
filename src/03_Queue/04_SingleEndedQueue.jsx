import { useMemo, useRef, useState } from 'react';

const DEFAULT_QUEUE = [8, 3, 11, 6];

function SingleEndedQueue({ onBack }) {
	const [inputText, setInputText] = useState('5');
	const [queue, setQueue] = useState(DEFAULT_QUEUE);
	const [activeIndex, setActiveIndex] = useState(null);
	const [peekFront, setPeekFront] = useState(queue.length ? queue[0] : null);
	const [peekRear, setPeekRear] = useState(queue.length ? queue[queue.length - 1] : null);
	const [status, setStatus] = useState('Use the buttons to enqueue or dequeue.');
	const initialQueueRef = useRef(DEFAULT_QUEUE);

	const frontIndex = queue.length ? 0 : null;
	const rearIndex = queue.length ? queue.length - 1 : null;
	const queueView = useMemo(
		() => queue.map((value, index) => ({ value, index })),
		[queue]
	);

	const handleEnqueue = () => {
		const value = parseNumber(inputText);
		if (value === null) {
			setStatus('Enter a valid number to enqueue.');
			return;
		}
		setQueue((prev) => {
			const next = [...prev, value];
			setActiveIndex(next.length - 1);
			setPeekRear(value);
			if (next.length === 1) {
				setPeekFront(value);
			}
			return next;
		});
		setStatus(`Enqueued ${value} at the rear.`);
	};

	const handleDequeue = () => {
		setQueue((prev) => {
			if (!prev.length) {
				setStatus('Queue is empty. Nothing to dequeue.');
				setActiveIndex(null);
				setPeekFront(null);
				setPeekRear(null);
				return prev;
			}
			const dequeued = prev[0];
			const next = prev.slice(1);
			setStatus(`Dequeued ${dequeued} from the front.`);
			setActiveIndex(next.length ? 0 : null);
			setPeekFront(next.length ? next[0] : null);
			setPeekRear(next.length ? next[next.length - 1] : null);
			return next;
		});
	};

	const handlePeekFront = () => {
		if (!queue.length) {
			setStatus('Queue is empty. Nothing at the front.');
			setActiveIndex(null);
			setPeekFront(null);
			setPeekRear(null);
			return;
		}
		setPeekFront(queue[0]);
		setActiveIndex(0);
		setStatus(`Front value is ${queue[0]}.`);
	};

	const handlePeekRear = () => {
		if (!queue.length) {
			setStatus('Queue is empty. Nothing at the rear.');
			setActiveIndex(null);
			setPeekFront(null);
			setPeekRear(null);
			return;
		}
		const lastIndex = queue.length - 1;
		setPeekRear(queue[lastIndex]);
		setActiveIndex(lastIndex);
		setStatus(`Rear value is ${queue[lastIndex]}.`);
	};

	const handleReset = () => {
		const baseQueue = initialQueueRef.current;
		setQueue(baseQueue);
		setActiveIndex(null);
		setPeekFront(baseQueue.length ? baseQueue[0] : null);
		setPeekRear(baseQueue.length ? baseQueue[baseQueue.length - 1] : null);
		setStatus('Queue reset.');
	};

	return (
		<div className="array-shell">
			<div className="array-card">
				<div className="page-header">
					<div>
						<div className="array-title">Single Ended Queue</div>
						<div className="array-meta">Enqueue at rear, dequeue from front</div>
					</div>
					<button className="back-btn" type="button" onClick={onBack}>
						Back to Queue
					</button>
				</div>

				<div className="info-grid">
					<div className="info-card">
						<h3>Queue Basics</h3>
						<p>Queues follow FIFO: First In, First Out. Enqueue adds to the rear, dequeue removes from the front.</p>
					</div>
					<div className="info-card">
						<h3>Peek Operations</h3>
						<p>Peek front/rear lets you inspect the queue ends without removing elements.</p>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Live Visualization</div>
					<div className="array-controls">
						<div className="control-field">
							<label>Value to enqueue</label>
							<input
								type="number"
								value={inputText}
								onChange={(event) => setInputText(event.target.value)}
								placeholder="e.g. 12"
							/>
						</div>
						<div className="control-field">
							<label>Front value</label>
							<input type="text" value={peekFront ?? '-'} readOnly />
						</div>
						<div className="control-field">
							<label>Rear value</label>
							<input type="text" value={peekRear ?? '-'} readOnly />
						</div>
					</div>
					<div className="viz-controls">
						<button className="array-btn" type="button" onClick={handleEnqueue}>
							Enqueue (Rear)
						</button>
						<button className="array-btn" type="button" onClick={handleDequeue}>
							Dequeue (Front)
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
							queueView.map(({ value, index }) => (
								<div
									key={`${value}-${index}`}
									className={`viz-cell ${index === activeIndex ? 'active' : ''} ${
										index === frontIndex ? 'top' : ''
									}`}
								>
									<div className="viz-value">{value}</div>
									<div className="stack-index">index {index}</div>
									{index === frontIndex && <div className="stack-index">front</div>}
									{index === rearIndex && <div className="stack-index">rear</div>}
								</div>
							))
						) : (
							<div className="stack-empty">Queue is empty.</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function parseNumber(text) {
	const value = Number.parseInt(text, 10);
	return Number.isFinite(value) ? value : null;
}

export default SingleEndedQueue;