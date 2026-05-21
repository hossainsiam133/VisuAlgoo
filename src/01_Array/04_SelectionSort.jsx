import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_VALUES = '12, 5, 8, 3, 16, 7, 10';
const RUN_DELAY_MS = 2000;

function SelectionSort({ onBack }) {
	const [inputText, setInputText] = useState(DEFAULT_VALUES);
	const [values, setValues] = useState(parseArrayInput(DEFAULT_VALUES).values);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [scanIndex, setScanIndex] = useState(1);
	const [minIndex, setMinIndex] = useState(0);
	const [sortedUntil, setSortedUntil] = useState(0);
	const [activeIndex, setActiveIndex] = useState(null);
	const [swappedPair, setSwappedPair] = useState([]);
	const [status, setStatus] = useState('Press Next Step to start sorting.');
	const valuesRef = useRef(values);
	const currentRef = useRef(currentIndex);
	const scanRef = useRef(scanIndex);
	const minRef = useRef(minIndex);
	const runRef = useRef({ timer: null });
	const initialValuesRef = useRef(values);

	useEffect(() => {
		valuesRef.current = values;
	}, [values]);

	useEffect(() => {
		currentRef.current = currentIndex;
	}, [currentIndex]);

	useEffect(() => {
		scanRef.current = scanIndex;
	}, [scanIndex]);

	useEffect(() => {
		minRef.current = minIndex;
	}, [minIndex]);

	useEffect(() => () => stopRun(), []);

	const maxValue = useMemo(() => Math.max(1, ...values), [values]);

	const stopRun = () => {
		if (runRef.current.timer) {
			clearTimeout(runRef.current.timer);
			runRef.current.timer = null;
		}
	};

	const resetSortState = () => {
		setCurrentIndex(0);
		setScanIndex(1);
		setMinIndex(0);
		setSortedUntil(0);
		setActiveIndex(null);
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
		setSortedUntil(valuesRef.current.length);
		setActiveIndex(null);
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
		if (currentRef.current >= valuesNow.length - 1) {
			finishSort();
			return false;
		}

		if (scanRef.current >= valuesNow.length) {
			const i = currentRef.current;
			const min = minRef.current;
			if (min !== i) {
				const temp = valuesNow[i];
				valuesNow[i] = valuesNow[min];
				valuesNow[min] = temp;
				setValues(valuesNow);
				setSwappedPair([i, min]);
				setStatus(`Swapped index ${i} with min index ${min}.`);
			} else {
				setSwappedPair([]);
				setStatus(`Index ${i} already has the minimum value.`);
			}

			const nextIndex = i + 1;
			setSortedUntil(nextIndex);
			setCurrentIndex(nextIndex);
			setScanIndex(nextIndex + 1);
			setMinIndex(nextIndex);
			setActiveIndex(null);
			return nextIndex < valuesNow.length - 1;
		}

		const j = scanRef.current;
		const min = minRef.current;
		setActiveIndex(j);
		if (valuesNow[j] < valuesNow[min]) {
			setMinIndex(j);
			setStatus(`New minimum found at index ${j}.`);
		} else {
			setStatus(`Checked index ${j}. No new minimum.`);
		}
		setScanIndex(j + 1);
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
		setStatus('Running selection sort...');
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
						<div className="array-title">Selection Sort</div>
						<div className="array-meta">Select the smallest remaining value each pass</div>
					</div>
					<button className="back-btn" type="button" onClick={onBack}>
						Back to Array
					</button>
				</div>

				<div className="info-grid">
					<div className="info-card">
						<h3>What is Selection Sort</h3>
						<p>
							Selection Sort repeatedly selects the smallest value and places it at the front.
						</p>
					</div>
					<div className="info-card">
						<h3>How Does It Work?</h3>
						<p>
							Scan the unsorted region for the minimum, then swap it into the next sorted slot.
						</p>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Algorithm Steps</div>
					<ol className="steps-list">
						<li>Start from the first index.</li>
						<li>Find the minimum value in the unsorted region.</li>
						<li>Swap it with the first unsorted value.</li>
						<li>Expand the sorted region by one.</li>
						<li>Repeat until sorted.</li>
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
							const isActive = index === activeIndex || index === currentIndex;
							const isMin = index === minIndex;
							const isSorted = index < sortedUntil;
							const isSwapped = swappedPair.includes(index);
							const height = 30 + Math.round((value / maxValue) * 170);
							return (
								<div key={`${value}-${index}`} className="bar-item">
									<div
										className={`bar ${isActive ? 'bar-active' : ''} ${isMin ? 'bar-swap' : ''} ${isSorted ? 'bar-sorted' : ''} ${isSwapped ? 'bar-swap' : ''}`}
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
						<code>{`void selectionSort(vector<int>& arr) {
	int n = static_cast<int>(arr.size());
	for (int i = 0; i < n - 1; ++i) {
		int minIndex = i;
		for (int j = i + 1; j < n; ++j) {
			if (arr[j] < arr[minIndex]) {
				minIndex = j;
			}
		}
		if (minIndex != i) {
			int temp = arr[i];
			arr[i] = arr[minIndex];
			arr[minIndex] = temp;
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

export default SelectionSort;