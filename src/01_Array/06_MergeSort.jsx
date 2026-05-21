import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_VALUES = '12, 5, 8, 3, 16, 7, 10';
const RUN_DELAY_MS = 600;

const initialValues = parseArrayInput(DEFAULT_VALUES).values;

function MergeSort({ onBack }) {
	const [inputText, setInputText] = useState(DEFAULT_VALUES);
	const [values, setValues] = useState(initialValues);
	const [steps, setSteps] = useState(() => buildSteps(initialValues));
	const [stepIndex, setStepIndex] = useState(-1);
	const [rangeInfo, setRangeInfo] = useState(null);
	const [comparePair, setComparePair] = useState([]);
	const [activeIndex, setActiveIndex] = useState(null);
	const [sortedRange, setSortedRange] = useState(null);
	const [status, setStatus] = useState('Press Next Step to start sorting.');
	const valuesRef = useRef(values);
	const stepsRef = useRef(steps);
	const stepIndexRef = useRef(stepIndex);
	const runRef = useRef({ timer: null });
	const initialValuesRef = useRef(values);

	useEffect(() => {
		valuesRef.current = values;
	}, [values]);

	useEffect(() => {
		stepsRef.current = steps;
	}, [steps]);

	useEffect(() => {
		stepIndexRef.current = stepIndex;
	}, [stepIndex]);

	useEffect(() => () => stopRun(), []);

	const maxValue = useMemo(() => Math.max(1, ...values), [values]);

	const stopRun = () => {
		if (runRef.current.timer) {
			clearTimeout(runRef.current.timer);
			runRef.current.timer = null;
		}
	};

	const resetSteps = (valuesNow) => {
		const nextSteps = buildSteps(valuesNow);
		setSteps(nextSteps);
		setStepIndex(-1);
		setRangeInfo(null);
		setComparePair([]);
		setActiveIndex(null);
		setSortedRange(null);
		setStatus('Press Next Step to start sorting.');
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
		resetSteps(parsed);
		setStatus('Values updated. Ready to sort.');
	};

	const handleRandomize = () => {
		stopRun();
		const length = 8 + Math.floor(Math.random() * 5);
		const randomValues = Array.from({ length }, () => Math.floor(Math.random() * 20) + 1);
		setInputText(randomValues.join(', '));
		setValues(randomValues);
		initialValuesRef.current = randomValues;
		resetSteps(randomValues);
		setStatus('Random values generated.');
	};

	const finishSort = () => {
		setSortedRange({ start: 0, end: valuesRef.current.length - 1 });
		setRangeInfo(null);
		setComparePair([]);
		setActiveIndex(null);
		setStatus('Sorting complete.');
		stopRun();
	};

	const applyStep = (step) => {
		if (step.type === 'divide') {
			setRangeInfo({
				leftStart: step.start,
				leftEnd: step.mid,
				rightStart: step.mid + 1,
				rightEnd: step.end,
				mid: step.mid,
				phase: 'divide'
			});
			setComparePair([]);
			setActiveIndex(null);
			setStatus(`Divide range ${step.start}-${step.end} at mid ${step.mid}.`);
			return;
		}
		if (step.type === 'merge') {
			setRangeInfo({
				leftStart: step.leftStart,
				leftEnd: step.leftEnd,
				rightStart: step.rightStart,
				rightEnd: step.rightEnd,
				mid: step.leftEnd,
				phase: 'merge'
			});
			setComparePair([]);
			setActiveIndex(null);
			setStatus(`Merge ranges ${step.leftStart}-${step.leftEnd} and ${step.rightStart}-${step.rightEnd}.`);
			return;
		}
		if (step.type === 'compare') {
			setRangeInfo({
				leftStart: step.leftStart,
				leftEnd: step.leftEnd,
				rightStart: step.rightStart,
				rightEnd: step.rightEnd,
				mid: step.leftEnd,
				phase: 'merge'
			});
			setComparePair([step.leftIndex, step.rightIndex]);
			setActiveIndex(null);
			const leftValue = valuesRef.current[step.leftIndex];
			const rightValue = valuesRef.current[step.rightIndex];
			setStatus(`Compare ${leftValue} and ${rightValue}.`);
			return;
		}
		if (step.type === 'write') {
			const updated = [...valuesRef.current];
			updated[step.index] = step.value;
			setValues(updated);
			setRangeInfo({
				leftStart: step.leftStart,
				leftEnd: step.leftEnd,
				rightStart: step.rightStart,
				rightEnd: step.rightEnd,
				mid: step.leftEnd,
				phase: 'merge'
			});
			setComparePair([]);
			setActiveIndex(step.index);
			setStatus(`Write ${step.value} at index ${step.index}.`);
			return;
		}
		if (step.type === 'complete') {
			setSortedRange({ start: step.start, end: step.end });
			setComparePair([]);
			setActiveIndex(null);
			setStatus(`Range ${step.start}-${step.end} sorted.`);
		}
	};

	const stepOnce = () => {
		const nextIndex = stepIndexRef.current + 1;
		if (nextIndex >= stepsRef.current.length) {
			finishSort();
			return false;
		}
		const step = stepsRef.current[nextIndex];
		setStepIndex(nextIndex);
		applyStep(step);
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
		setStatus('Running merge sort...');
		runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
	};

	const handleReset = () => {
		stopRun();
		setValues(initialValuesRef.current);
		resetSteps(initialValuesRef.current);
		setStatus('Sort reset.');
	};

	const hasRanges = Boolean(rangeInfo);
	const leftLabel = hasRanges ? `${rangeInfo.leftStart}-${rangeInfo.leftEnd}` : '-';
	const rightLabel = hasRanges ? `${rangeInfo.rightStart}-${rangeInfo.rightEnd}` : '-';
	const phaseLabel = hasRanges ? rangeInfo.phase : '-';

	return (
		<div className="array-shell">
			<div className="array-card">
				<div className="page-header">
					<div>
						<div className="array-title">Merge Sort</div>
						<div className="array-meta">Divide, sort subarrays, then merge them</div>
					</div>
					<button className="back-btn" type="button" onClick={onBack}>
						Back to Array
					</button>
				</div>

				<div className="info-grid">
					<div className="info-card">
						<h3>What is Merge Sort</h3>
						<p>
							Merge Sort uses divide and conquer to split arrays, sort them, and merge the sorted
							results.
						</p>
					</div>
					<div className="info-card">
						<h3>How Does It Work?</h3>
						<p>
							Split the array in half until single elements remain, then merge while comparing
							values.
						</p>
					</div>
				</div>

				<div className="section-block">
					<div className="section-title">Algorithm Steps</div>
					<ol className="steps-list">
						<li>Split the array into halves.</li>
						<li>Recursively sort each half.</li>
						<li>Merge sorted halves by comparing elements.</li>
						<li>Write the smallest remaining value.</li>
						<li>Repeat until fully merged.</li>
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
						<div className="graph-bar active">
							<span>O(n log n)</span>
						</div>
						<div className="graph-bar">
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
					<div className="range-bar">
						<span className="range-chip range-left">left: {leftLabel}</span>
						<span className="range-chip range-right">right: {rightLabel}</span>
						<span className="range-chip range-mid">phase: {phaseLabel}</span>
					</div>
					<div className="bar-chart">
						{values.map((value, index) => {
							const inLeftRange = rangeInfo && index >= rangeInfo.leftStart && index <= rangeInfo.leftEnd;
							const inRightRange = rangeInfo && index >= rangeInfo.rightStart && index <= rangeInfo.rightEnd;
							const isCompare = comparePair.includes(index);
							const isActive = index === activeIndex;
							const isSorted =
								sortedRange && index >= sortedRange.start && index <= sortedRange.end;
							const height = 30 + Math.round((value / maxValue) * 170);
							return (
								<div key={`${value}-${index}`} className="bar-item">
									<div
										className={`bar ${inLeftRange ? 'bar-left' : ''} ${inRightRange ? 'bar-right' : ''} ${isCompare ? 'bar-active' : ''} ${isActive ? 'bar-swap' : ''} ${isSorted ? 'bar-sorted' : ''}`}
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
						<code>{`void merge(vector<int>& arr, int left, int mid, int right) {
	vector<int> leftArr(arr.begin() + left, arr.begin() + mid + 1);
	vector<int> rightArr(arr.begin() + mid + 1, arr.begin() + right + 1);
	int i = 0, j = 0, k = left;
	while (i < static_cast<int>(leftArr.size()) && j < static_cast<int>(rightArr.size())) {
		if (leftArr[i] <= rightArr[j]) {
			arr[k++] = leftArr[i++];
		} else {
			arr[k++] = rightArr[j++];
		}
	}
	while (i < static_cast<int>(leftArr.size())) {
		arr[k++] = leftArr[i++];
	}
	while (j < static_cast<int>(rightArr.size())) {
		arr[k++] = rightArr[j++];
	}
}

void mergeSort(vector<int>& arr, int left, int right) {
	if (left >= right) {
		return;
	}
	int mid = (left + right) / 2;
	mergeSort(arr, left, mid);
	mergeSort(arr, mid + 1, right);
	merge(arr, left, mid, right);
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

function buildSteps(values) {
	const steps = [];
	const working = [...values];

	const sortRange = (start, end) => {
		if (start >= end) {
			return;
		}
		const mid = Math.floor((start + end) / 2);
		steps.push({ type: 'divide', start, end, mid });
		sortRange(start, mid);
		sortRange(mid + 1, end);
		steps.push({
			type: 'merge',
			leftStart: start,
			leftEnd: mid,
			rightStart: mid + 1,
			rightEnd: end
		});

		const left = working.slice(start, mid + 1);
		const right = working.slice(mid + 1, end + 1);
		let i = 0;
		let j = 0;
		let k = start;

		while (i < left.length && j < right.length) {
			steps.push({
				type: 'compare',
				leftIndex: start + i,
				rightIndex: mid + 1 + j,
				leftStart: start,
				leftEnd: mid,
				rightStart: mid + 1,
				rightEnd: end
			});
			if (left[i] <= right[j]) {
				steps.push({
					type: 'write',
					index: k,
					value: left[i],
					leftStart: start,
					leftEnd: mid,
					rightStart: mid + 1,
					rightEnd: end
				});
				working[k] = left[i];
				i += 1;
			} else {
				steps.push({
					type: 'write',
					index: k,
					value: right[j],
					leftStart: start,
					leftEnd: mid,
					rightStart: mid + 1,
					rightEnd: end
				});
				working[k] = right[j];
				j += 1;
			}
			k += 1;
		}

		while (i < left.length) {
			steps.push({
				type: 'write',
				index: k,
				value: left[i],
				leftStart: start,
				leftEnd: mid,
				rightStart: mid + 1,
				rightEnd: end
			});
			working[k] = left[i];
			i += 1;
			k += 1;
		}

		while (j < right.length) {
			steps.push({
				type: 'write',
				index: k,
				value: right[j],
				leftStart: start,
				leftEnd: mid,
				rightStart: mid + 1,
				rightEnd: end
			});
			working[k] = right[j];
			j += 1;
			k += 1;
		}

		steps.push({ type: 'complete', start, end });
	};

	if (values.length > 1) {
		sortRange(0, values.length - 1);
	}

	return steps;
}

export default MergeSort;
