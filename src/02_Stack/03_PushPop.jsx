import { useMemo, useRef, useState } from 'react';

const DEFAULT_STACK = [12, 7, 4];

function PushPop({ onBack }) {
	const [inputText, setInputText] = useState('9');
	const [stack, setStack] = useState(DEFAULT_STACK);
	const [activeIndex, setActiveIndex] = useState(null);
	const [peekValue, setPeekValue] = useState(stack.length ? stack[stack.length - 1] : null);
	const [status, setStatus] = useState('Use the buttons to push, pop, or peek.');
	const initialStackRef = useRef(DEFAULT_STACK);

	const topIndex = stack.length - 1;
	const stackView = useMemo(
		() => stack.map((value, index) => ({ value, index })).reverse(),
		[stack]
	);

	const handlePush = () => {
		const value = parseNumber(inputText);
		if (value === null) {
			setStatus('Enter a valid number to push.');
			return;
		}
		setStack((prev) => {
			const next = [...prev, value];
			setActiveIndex(next.length - 1);
			setPeekValue(value);
			return next;
		});
		setStatus(`Pushed ${value} onto the stack.`);
	};

	const handlePop = () => {
		setStack((prev) => {
			if (!prev.length) {
				setStatus('Stack is empty. Nothing to pop.');
				setActiveIndex(null);
				setPeekValue(null);
				return prev;
			}
			const popped = prev[prev.length - 1];
			const next = prev.slice(0, -1);
			setStatus(`Popped ${popped} from the stack.`);
			setActiveIndex(next.length - 1);
			setPeekValue(next.length ? next[next.length - 1] : null);
			return next;
		});
	};

	const handlePeek = () => {
		if (!stack.length) {
			setStatus('Stack is empty. Nothing to peek.');
			setActiveIndex(null);
			setPeekValue(null);
			return;
		}
		const value = stack[topIndex];
		setPeekValue(value);
		setActiveIndex(topIndex);
		setStatus(`Peeked top value ${value}.`);
	};

	const handleReset = () => {
		const baseStack = initialStackRef.current;
		setStack(baseStack);
		setActiveIndex(null);
		setPeekValue(baseStack.length ? baseStack[baseStack.length - 1] : null);
		setStatus('Stack reset.');
	};

	return (
		<div className="array-shell">
			<div className="array-card">
				<div className="page-header">
					<div>
						<div className="array-title">Stack Push & Pop</div>
						<div className="array-meta">Visualize stack operations in real time</div>
					</div>
					<button className="back-btn" type="button" onClick={onBack}>
						Back to Stack
					</button>
				</div>

				<div className="info-grid">
					<div className="info-card">
						<h3>Stack Basics</h3>
						<p>Stacks follow LIFO: Last In, First Out. Push adds to the top, pop removes from the top.</p>
					</div>
					<div className="info-card">
						<h3>Peek</h3>
						<p>Peek lets you inspect the top element without removing it from the stack.</p>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Live Visualization</div>
					<div className="array-controls">
						<div className="control-field">
							<label>Value to push</label>
							<input
								type="number"
								value={inputText}
								onChange={(event) => setInputText(event.target.value)}
								placeholder="e.g. 10"
							/>
						</div>
						<div className="control-field">
							<label>Top value</label>
							<input type="text" value={peekValue ?? '-'} readOnly />
						</div>
					</div>
					<div className="viz-controls">
						<button className="array-btn" type="button" onClick={handlePush}>
							Push
						</button>
						<button className="array-btn" type="button" onClick={handlePop}>
							Pop
						</button>
						<button className="array-btn" type="button" onClick={handlePeek}>
							Peek
						</button>
						<button className="array-btn" type="button" onClick={handleReset}>
							Reset
						</button>
					</div>
					<div className="array-status">{status}</div>
					<div className="stack-meta">
						<span>Size: {stack.length}</span>
						<span>Top index: {stack.length ? topIndex : '-'}</span>
					</div>
					<div className="stack-viz">
						{stackView.length ? (
							stackView.map(({ value, index }) => (
								<div
									key={`${value}-${index}`}
									className={`stack-item ${index === activeIndex ? 'active' : ''} ${
										index === topIndex ? 'top' : ''
									}`}
								>
									<div className="stack-value">{value}</div>
									<div className="stack-index">index {index}</div>
								</div>
							))
						) : (
							<div className="stack-empty">Stack is empty.</div>
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

export default PushPop;
