import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_VALUES = '12, 5, 8, 3, 16, 7, 10';
const RUN_DELAY_MS = 2000;

function BubbleSort({ onBack }) {
	const [inputText, setInputText] = useState(DEFAULT_VALUES);
	const [values, setValues] = useState(parseArrayInput(DEFAULT_VALUES).values);
	const [passIndex, setPassIndex] = useState(0);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [sortedFrom, setSortedFrom] = useState(values.length);
	const [activePair, setActivePair] = useState([]);
	const [swappedPair, setSwappedPair] = useState([]);
	const [status, setStatus] = useState('Press Next Step to start sorting.');
	const valuesRef = useRef(values);
	const passRef = useRef(passIndex);
	const indexRef = useRef(currentIndex);
	const runRef = useRef({ timer: null });
	const initialValuesRef = useRef(values);

	useEffect(() => {
		valuesRef.current = values;
		setSortedFrom(values.length);
	}, [values]);

	useEffect(() => {
		passRef.current = passIndex;
	}, [passIndex]);

	useEffect(() => {
		indexRef.current = currentIndex;
	}, [currentIndex]);

	useEffect(() => () => stopRun(), []);

	const maxValue = useMemo(() => Math.max(1, ...values), [values]);

	const stopRun = () => {
		if (runRef.current.timer) {
			clearTimeout(runRef.current.timer);
			runRef.current.timer = null;
		}
	};

	const resetSortState = () => {
		setPassIndex(0);
		setCurrentIndex(0);
		setSortedFrom(valuesRef.current.length);
		setActivePair([]);
		setSwappedPair([]);
	};

	const handleApplyValues = () => {
		stopRun();
		const parsed = parseArrayInput(inputText).values;
		if (!parsed.length) {
			setStatus('Enter a valid array to visualize.');
			return;
		}
		setValues(parsed);
		initialValuesRef.current = parsed;
		resetSortState();
		setStatus('Values updated. Ready to sort.');
	};

	const handleRandomize = () => {
		stopRun();
		const length = 8 + Math.floor(Math.random() * 5);
		const randomValues = Array.from({ length }, () => Math.floor(Math.random() * 20) + 1);
		setInputText(randomValues.join(', '));
		setValues(randomValues);
		initialValuesRef.current = randomValues;
		resetSortState();
		setStatus('Random values generated.');
	};

	const finishSort = () => {
		setSortedFrom(0);
		setActivePair([]);
		setSwappedPair([]);
		setStatus('Sorting complete.');
		stopRun();
	};

	const stepOnce = () => {
		const valuesNow = [...valuesRef.current];
		if (valuesNow.length < 2) {
			setStatus('Add at least two values to sort.');
			return false;
		}
		if (passRef.current >= valuesNow.length - 1) {
			finishSort();
			return false;
		}

		const lastUnsortedIndex = valuesNow.length - 1 - passRef.current;
		const j = indexRef.current;
		if (j >= lastUnsortedIndex) {
			const nextPass = passRef.current + 1;
			setPassIndex(nextPass);
			setCurrentIndex(0);
			setSortedFrom(valuesNow.length - nextPass);
			setActivePair([]);
			setSwappedPair([]);
			setStatus(`Pass ${nextPass} complete. Moving to next pass.`);
			return true;
		}

		const leftValue = valuesNow[j];
		const rightValue = valuesNow[j + 1];
		setActivePair([j, j + 1]);
		if (leftValue > rightValue) {
			valuesNow[j] = rightValue;
			valuesNow[j + 1] = leftValue;
			setValues(valuesNow);
			setSwappedPair([j, j + 1]);
			setStatus(`Swapped ${leftValue} and ${rightValue}.`);
		} else {
			setSwappedPair([]);
			setStatus(`Compared ${leftValue} and ${rightValue}. No swap.`);
		}

		setCurrentIndex(j + 1);
		return true;
	};

	const handleStep = () => {
		stopRun();
		stepOnce();
	};

	const runStep = () => {
		if (!stepOnce()) {
			stopRun();
			return;
		}
		runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
	};

	const handleRun = () => {
		if (valuesRef.current.length < 2) {
			setStatus('Add at least two values to sort.');
			return;
		}
		stopRun();
		setStatus('Running bubble sort...');
		runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
	};

	const handleReset = () => {
		stopRun();
		setValues(initialValuesRef.current);
		resetSortState();
		setStatus('Sort reset.');
	};

	return (
		<div className="array-shell">
			<div className="array-card">
				<div className="page-header">
					<div>
						<div className="array-title">Bubble Sort</div>
						<div className="array-meta">Repeatedly swap adjacent out-of-order values</div>
					</div>
					<button className="back-btn" type="button" onClick={onBack}>
						Back to Array
					</button>
				</div>

				<div className="info-grid">
					<div className="info-card">
						<h3>What is Bubble Sort</h3>
						<p>
							Bubble Sort compares adjacent items and swaps them when they are in the wrong order.
						</p>
					</div>
					<div className="info-card">
						<h3>How Does It Work?</h3>
						<p>
							Each pass moves the largest remaining value to the right. Continue until the array is
							sorted.
						</p>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Algorithm Steps</div>
					<ol className="steps-list">
						<li>Start from the beginning of the array.</li>
						<li>Compare adjacent values.</li>
						<li>Swap them if the left value is larger.</li>
						<li>Repeat for each pass, shrinking the unsorted region.</li>
						<li>Stop when no swaps are needed.</li>
					</ol>
				</div>

				<div className="section-block">
					<div className="section-title">Time Complexity</div>
					<div className="complexity-graph">
						<div className="graph-bar">
							<span>O(1)</span>
						</div>
						<div className="graph-bar">
							<span>O(log n)</span>
						</div>
						<div className="graph-bar">
							<span>O(n)</span>
						</div>
						<div className="graph-bar">
							<span>O(n log n)</span>
						</div>
						<div className="graph-bar active">
							<span>O(n^2)</span>
						</div>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Live Visualization</div>
					<div className="array-controls">
						<div className="control-field">
							<label>Array values</label>
							<input
								type="text"
								value={inputText}
								onChange={(event) => setInputText(event.target.value)}
								placeholder="e.g. 4, 8, 2, 9"
							/>
						</div>
					</div>
					<div className="viz-controls">
						<button className="array-btn" type="button" onClick={handleApplyValues}>
							Apply Values
						</button>
						<button className="array-btn" type="button" onClick={handleRandomize}>
							Randomize
						</button>
						<button className="array-btn" type="button" onClick={handleStep}>
							Next Step
						</button>
						<button className="array-btn" type="button" onClick={handleRun}>
							Run Sort
						</button>
						<button className="array-btn" type="button" onClick={handleReset}>
							Reset
						</button>
					</div>
					<div className="array-status">{status}</div>
					<div className="bar-chart">
						{values.map((value, index) => {
							const isActive = activePair.includes(index);
							const isSwapped = swappedPair.includes(index);
							const isSorted = index >= sortedFrom;
							const height = 30 + Math.round((value / maxValue) * 170);
							return (
								<div key={`${value}-${index}`} className="bar-item">
									<div
										className={`bar ${isActive ? 'bar-active' : ''} ${isSwapped ? 'bar-swap' : ''} ${isSorted ? 'bar-sorted' : ''}`}
										style={{ height: `${height}px` }}
									/>
									<div className="bar-label">{value}</div>
								</div>
							);
						})}
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Implementation Code in C++</div>
					<pre className="code-block">
						<code>{`void bubbleSort(vector<int>& arr) {
	int n = static_cast<int>(arr.size());
	for (int i = 0; i < n - 1; ++i) {
		for (int j = 0; j < n - 1 - i; ++j) {
			if (arr[j] > arr[j + 1]) {
				int temp = arr[j];
				arr[j] = arr[j + 1];
				arr[j + 1] = temp;
			}
		}
	}
}`}</code>
					</pre>
				</div>
			</div>
		</div>
	);
}

function parseArrayInput(text) {
	const tokens = text.split(/[\s,]+/).filter(Boolean);
	const values = tokens
		.map((token) => Number.parseInt(token, 10))
		.filter((value) => Number.isFinite(value));
	return { values };
}

export default BubbleSort;
