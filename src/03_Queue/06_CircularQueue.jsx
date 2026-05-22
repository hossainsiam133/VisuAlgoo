import { useMemo, useRef, useState } from 'react';

const CAPACITY = 6;
const DEFAULT_VALUES = [5, 12, 7];

function buildInitialState() {
	const buffer = Array.from({ length: CAPACITY }, () => null);
	DEFAULT_VALUES.forEach((value, index) => {
		buffer[index] = value;
	});
	return {
		buffer,
		front: DEFAULT_VALUES.length ? 0 : 0,
		rear: DEFAULT_VALUES.length ? DEFAULT_VALUES.length - 1 : -1,
		size: DEFAULT_VALUES.length
	};
}

function CircularQueue({ onBack }) {
	const initialStateRef = useRef(buildInitialState());
	const [inputText, setInputText] = useState('9');
	const [buffer, setBuffer] = useState(initialStateRef.current.buffer);
	const [front, setFront] = useState(initialStateRef.current.front);
	const [rear, setRear] = useState(initialStateRef.current.rear);
	const [size, setSize] = useState(initialStateRef.current.size);
	const [activeIndex, setActiveIndex] = useState(null);
	const [peekFront, setPeekFront] = useState(size ? buffer[front] : null);
	const [peekRear, setPeekRear] = useState(size ? buffer[rear] : null);
	const [status, setStatus] = useState('Use the buttons to enqueue or dequeue.');

	const slotsView = useMemo(
		() => buffer.map((value, index) => ({ value, index })),
		[buffer]
	);

	const handleEnqueue = () => {
		const value = parseNumber(inputText);
		if (value === null) {
			setStatus('Enter a valid number to enqueue.');
			return;
		}
		if (size >= CAPACITY) {
			setStatus('Queue is full. Cannot enqueue.');
			return;
		}
		const nextRear = (rear + 1 + CAPACITY) % CAPACITY;
		setBuffer((prev) => {
			const next = [...prev];
			next[nextRear] = value;
			return next;
		});
		const nextSize = size + 1;
		const nextFront = nextSize === 1 ? nextRear : front;
		setFront(nextFront);
		setRear(nextRear);
		setSize(nextSize);
		setActiveIndex(nextRear);
		setPeekFront(nextSize ? (nextSize === 1 ? value : buffer[nextFront]) : null);
		setPeekRear(value);
		setStatus(`Enqueued ${value} at the rear.`);
	};

	const handleDequeue = () => {
		if (!size) {
			setStatus('Queue is empty. Nothing to dequeue.');
			setActiveIndex(null);
			setPeekFront(null);
			setPeekRear(null);
			return;
		}
		const removed = buffer[front];
		setBuffer((prev) => {
			const next = [...prev];
			next[front] = null;
			return next;
		});
		const nextSize = size - 1;
		const nextFront = nextSize ? (front + 1) % CAPACITY : 0;
		const nextRear = nextSize ? rear : -1;
		setFront(nextFront);
		setRear(nextRear);
		setSize(nextSize);
		setActiveIndex(front);
		setPeekFront(nextSize ? buffer[nextFront] : null);
		setPeekRear(nextSize ? buffer[nextRear] : null);
		setStatus(`Dequeued ${removed} from the front.`);
	};

	const handlePeekFront = () => {
		if (!size) {
			setStatus('Queue is empty. Nothing at the front.');
			setActiveIndex(null);
			setPeekFront(null);
			setPeekRear(null);
			return;
		}
		setPeekFront(buffer[front]);
		setActiveIndex(front);
		setStatus(`Front value is ${buffer[front]}.`);
	};

	const handlePeekRear = () => {
		if (!size) {
			setStatus('Queue is empty. Nothing at the rear.');
			setActiveIndex(null);
			setPeekFront(null);
			setPeekRear(null);
			return;
		}
		setPeekRear(buffer[rear]);
		setActiveIndex(rear);
		setStatus(`Rear value is ${buffer[rear]}.`);
	};

	const handleReset = () => {
		const baseState = buildInitialState();
		initialStateRef.current = baseState;
		setBuffer(baseState.buffer);
		setFront(baseState.front);
		setRear(baseState.rear);
		setSize(baseState.size);
		setActiveIndex(null);
		setPeekFront(baseState.size ? baseState.buffer[baseState.front] : null);
		setPeekRear(baseState.size ? baseState.buffer[baseState.rear] : null);
		setStatus('Queue reset.');
	};

	return (
		<div className="array-shell">
			<div className="array-card">
				<div className="page-header">
					<div>
						<div className="array-title">Circular Queue</div>
						<div className="array-meta">Fixed-size queue with wrap-around indices</div>
					</div>
					<button className="back-btn" type="button" onClick={onBack}>
						Back to Queue
					</button>
				</div>

				<div className="info-grid">
					<div className="info-card">
						<h3>How It Works</h3>
						<p>When the rear hits the end, it wraps to the start. This reuses empty slots efficiently.</p>
					</div>
					<div className="info-card">
						<h3>Capacity</h3>
						<p>Here the queue size is fixed to {CAPACITY}. Enqueue is blocked when full.</p>
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
								placeholder="e.g. 8"
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
						<span>Size: {size}</span>
						<span>Front index: {size ? front : '-'}</span>
						<span>Rear index: {size ? rear : '-'}</span>
						<span>Capacity: {CAPACITY}</span>
					</div>
					<div className="viz-array">
						{slotsView.map(({ value, index }) => (
							<div
								key={`slot-${index}`}
								className={`viz-cell ${index === activeIndex ? 'active' : ''} ${
									index === front && size ? 'top' : ''
								}`}
							>
								<div className="viz-value">{value ?? '-'}</div>
								<div className="stack-index">index {index}</div>
								{size ? (
									<>
										{index === front && <div className="stack-index">front</div>}
										{index === rear && <div className="stack-index">rear</div>}
									</>
								) : null}
							</div>
						))}
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

export default CircularQueue;