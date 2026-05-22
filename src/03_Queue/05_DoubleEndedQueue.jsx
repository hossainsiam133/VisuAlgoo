import { useMemo, useRef, useState } from 'react';

const DEFAULT_DEQUE = [14, 9, 2, 7];

function DoubleEndedQueue({ onBack }) {
	const [inputText, setInputText] = useState('4');
	const [deque, setDeque] = useState(DEFAULT_DEQUE);
	const [activeIndex, setActiveIndex] = useState(null);
	const [peekFront, setPeekFront] = useState(deque.length ? deque[0] : null);
	const [peekRear, setPeekRear] = useState(deque.length ? deque[deque.length - 1] : null);
	const [status, setStatus] = useState('Use the buttons to add or remove from either end.');
	const initialDequeRef = useRef(DEFAULT_DEQUE);

	const frontIndex = deque.length ? 0 : null;
	const rearIndex = deque.length ? deque.length - 1 : null;
	const dequeView = useMemo(
		() => deque.map((value, index) => ({ value, index })),
		[deque]
	);

	const handleAddFront = () => {
		const value = parseNumber(inputText);
		if (value === null) {
			setStatus('Enter a valid number to add at the front.');
			return;
		}
		setDeque((prev) => {
			const next = [value, ...prev];
			setActiveIndex(0);
			setPeekFront(value);
			if (next.length === 1) {
				setPeekRear(value);
			} else {
				setPeekRear(next[next.length - 1]);
			}
			return next;
		});
		setStatus(`Added ${value} to the front.`);
	};

	const handleAddRear = () => {
		const value = parseNumber(inputText);
		if (value === null) {
			setStatus('Enter a valid number to add at the rear.');
			return;
		}
		setDeque((prev) => {
			const next = [...prev, value];
			setActiveIndex(next.length - 1);
			setPeekRear(value);
			if (next.length === 1) {
				setPeekFront(value);
			}
			return next;
		});
		setStatus(`Added ${value} to the rear.`);
	};

	const handleRemoveFront = () => {
		setDeque((prev) => {
			if (!prev.length) {
				setStatus('Deque is empty. Nothing to remove from the front.');
				setActiveIndex(null);
				setPeekFront(null);
				setPeekRear(null);
				return prev;
			}
			const removed = prev[0];
			const next = prev.slice(1);
			setStatus(`Removed ${removed} from the front.`);
			setActiveIndex(next.length ? 0 : null);
			setPeekFront(next.length ? next[0] : null);
			setPeekRear(next.length ? next[next.length - 1] : null);
			return next;
		});
	};

	const handleRemoveRear = () => {
		setDeque((prev) => {
			if (!prev.length) {
				setStatus('Deque is empty. Nothing to remove from the rear.');
				setActiveIndex(null);
				setPeekFront(null);
				setPeekRear(null);
				return prev;
			}
			const removed = prev[prev.length - 1];
			const next = prev.slice(0, -1);
			setStatus(`Removed ${removed} from the rear.`);
			setActiveIndex(next.length ? next.length - 1 : null);
			setPeekFront(next.length ? next[0] : null);
			setPeekRear(next.length ? next[next.length - 1] : null);
			return next;
		});
	};

	const handlePeekFront = () => {
		if (!deque.length) {
			setStatus('Deque is empty. Nothing at the front.');
			setActiveIndex(null);
			setPeekFront(null);
			setPeekRear(null);
			return;
		}
		setPeekFront(deque[0]);
		setActiveIndex(0);
		setStatus(`Front value is ${deque[0]}.`);
	};

	const handlePeekRear = () => {
		if (!deque.length) {
			setStatus('Deque is empty. Nothing at the rear.');
			setActiveIndex(null);
			setPeekFront(null);
			setPeekRear(null);
			return;
		}
		const lastIndex = deque.length - 1;
		setPeekRear(deque[lastIndex]);
		setActiveIndex(lastIndex);
		setStatus(`Rear value is ${deque[lastIndex]}.`);
	};

	const handleReset = () => {
		const baseDeque = initialDequeRef.current;
		setDeque(baseDeque);
		setActiveIndex(null);
		setPeekFront(baseDeque.length ? baseDeque[0] : null);
		setPeekRear(baseDeque.length ? baseDeque[baseDeque.length - 1] : null);
		setStatus('Deque reset.');
	};

	return (
		<div className="array-shell">
			<div className="array-card">
				<div className="page-header">
					<div>
						<div className="array-title">Double Ended Queue (Deque)</div>
						<div className="array-meta">Add and remove elements from both ends</div>
					</div>
					<button className="back-btn" type="button" onClick={onBack}>
						Back to Queue
					</button>
				</div>

				<div className="info-grid">
					<div className="info-card">
						<h3>Deque Basics</h3>
						<p>Double ended queues let you enqueue/dequeue from both the front and rear.</p>
					</div>
					<div className="info-card">
						<h3>Use Cases</h3>
						<p>Useful for sliding window problems, scheduling, and as both stack and queue.</p>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Live Visualization</div>
					<div className="array-controls">
						<div className="control-field">
							<label>Value to add</label>
							<input
								type="number"
								value={inputText}
								onChange={(event) => setInputText(event.target.value)}
								placeholder="e.g. 10"
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
						<button className="array-btn" type="button" onClick={handleAddFront}>
							Add Front
						</button>
						<button className="array-btn" type="button" onClick={handleAddRear}>
							Add Rear
						</button>
						<button className="array-btn" type="button" onClick={handleRemoveFront}>
							Remove Front
						</button>
						<button className="array-btn" type="button" onClick={handleRemoveRear}>
							Remove Rear
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
						<span>Size: {deque.length}</span>
						<span>Front index: {frontIndex ?? '-'}</span>
						<span>Rear index: {rearIndex ?? '-'}</span>
					</div>
					<div className="viz-array">
						{dequeView.length ? (
							dequeView.map(({ value, index }) => (
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
							<div className="stack-empty">Deque is empty.</div>
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

export default DoubleEndedQueue;