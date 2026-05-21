import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_VALUES = '12, 5, 8, 3, 16, 7, 10';
const RUN_DELAY_MS = 2000;

function InsertionSort({ onBack }) {
    const [inputText, setInputText] = useState(DEFAULT_VALUES);
    const [values, setValues] = useState(parseArrayInput(DEFAULT_VALUES).values);
    const [currentIndex, setCurrentIndex] = useState(1);
    const [scanIndex, setScanIndex] = useState(0);
    const [keyValue, setKeyValue] = useState(null);
    const [keyIndex, setKeyIndex] = useState(null);
    const [sortedUntil, setSortedUntil] = useState(values.length ? 1 : 0);
    const [activePair, setActivePair] = useState([]);
    const [swappedPair, setSwappedPair] = useState([]);
    const [phase, setPhase] = useState('select');
    const [status, setStatus] = useState('Press Next Step to start sorting.');
    const valuesRef = useRef(values);
    const currentRef = useRef(currentIndex);
    const scanRef = useRef(scanIndex);
    const keyRef = useRef(keyValue);
    const phaseRef = useRef(phase);
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
        keyRef.current = keyValue;
    }, [keyValue]);

    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    useEffect(() => () => stopRun(), []);

    const maxValue = useMemo(() => Math.max(1, ...values), [values]);

    const stopRun = () => {
        if (runRef.current.timer) {
            clearTimeout(runRef.current.timer);
            runRef.current.timer = null;
        }
    };

    const resetSortState = (valuesNow) => {
        const hasValues = valuesNow.length > 0;
        setCurrentIndex(1);
        setScanIndex(0);
        setKeyValue(null);
        setKeyIndex(null);
        setSortedUntil(hasValues ? 1 : 0);
        setActivePair([]);
        setSwappedPair([]);
        setPhase('select');
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
        resetSortState(parsed);
        setStatus('Values updated. Ready to sort.');
    };

    const handleRandomize = () => {
        stopRun();
        const length = 8 + Math.floor(Math.random() * 5);
        const randomValues = Array.from({ length }, () => Math.floor(Math.random() * 20) + 1);
        setInputText(randomValues.join(', '));
        setValues(randomValues);
        initialValuesRef.current = randomValues;
        resetSortState(randomValues);
        setStatus('Random values generated.');
    };

    const finishSort = () => {
        setSortedUntil(valuesRef.current.length);
        setActivePair([]);
        setSwappedPair([]);
        setKeyValue(null);
        setKeyIndex(null);
        setStatus('Sorting complete.');
        stopRun();
    };

    const stepOnce = () => {
        const valuesNow = [...valuesRef.current];
        if (valuesNow.length < 2) {
            setStatus('Add at least two values to sort.');
            return false;
        }
        if (currentRef.current >= valuesNow.length) {
            finishSort();
            return false;
        }

        if (phaseRef.current === 'select') {
            const key = valuesNow[currentRef.current];
            setKeyValue(key);
            setKeyIndex(currentRef.current);
            setScanIndex(currentRef.current - 1);
            setActivePair([currentRef.current]);
            setSwappedPair([]);
            setPhase('scan');
            setStatus(`Selected key ${key} at index ${currentRef.current}.`);
            return true;
        }

        const j = scanRef.current;
        const key = keyRef.current;
        if (j >= 0 && valuesNow[j] > key) {
            valuesNow[j + 1] = valuesNow[j];
            setValues(valuesNow);
            setSwappedPair([j, j + 1]);
            setActivePair([j, j + 1]);
            setStatus(`Shifted ${valuesNow[j]} right.`);
            setScanIndex(j - 1);
            return true;
        }

        valuesNow[j + 1] = key;
        setValues(valuesNow);
        setSwappedPair([j + 1]);
        const nextIndex = currentRef.current + 1;
        setSortedUntil(nextIndex);
        setCurrentIndex(nextIndex);
        setScanIndex(nextIndex - 1);
        setPhase('select');
        setActivePair([]);
        setKeyIndex(null);
        setStatus(`Inserted key at index ${j + 1}.`);
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
        setStatus('Running insertion sort...');
        runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
    };

    const handleReset = () => {
        stopRun();
        setValues(initialValuesRef.current);
        resetSortState(initialValuesRef.current);
        setStatus('Sort reset.');
    };

    return (
        <div className="array-shell">
            <div className="array-card">
                <div className="page-header">
                    <div>
                        <div className="array-title">Insertion Sort</div>
                        <div className="array-meta">Insert each value into the sorted prefix</div>
                    </div>
                    <button className="back-btn" type="button" onClick={onBack}>
                        Back to Array
                    </button>
                </div>

                <div className="info-grid">
                    <div className="info-card">
                        <h3>What is Insertion Sort</h3>
                        <p>
                            Insertion Sort builds a sorted section one element at a time by inserting each new
                            value into its proper position.
                        </p>
                    </div>
                    <div className="info-card">
                        <h3>How Does It Work?</h3>
                        <p>
                            Pick the next value, shift larger values right, and insert the key in the gap.
                        </p>
                    </div>
                </div>

                <div className="section-block">
                    <div className="section-title">Algorithm Steps</div>
                    <ol className="steps-list">
                        <li>Start with the first value as sorted.</li>
                        <li>Select the next value as the key.</li>
                        <li>Shift larger values to the right.</li>
                        <li>Insert the key into the gap.</li>
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
                            const isActive = activePair.includes(index) || index === scanIndex;
                            const isKey = index === keyIndex;
                            const isSorted = index < sortedUntil;
                            const isSwapped = swappedPair.includes(index);
                            const height = 30 + Math.round((value / maxValue) * 170);
                            return (
                                <div key={`${value}-${index}`} className="bar-item">
                                    <div
                                        className={`bar ${isActive ? 'bar-active' : ''} ${isKey ? 'bar-swap' : ''} ${isSorted ? 'bar-sorted' : ''} ${isSwapped ? 'bar-swap' : ''}`}
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
                        <code>{`void insertionSort(vector<int>& arr) {
	int n = static_cast<int>(arr.size());
	for (int i = 1; i < n; ++i) {
		int key = arr[i];
		int j = i - 1;
		while (j >= 0 && arr[j] > key) {
			arr[j + 1] = arr[j];
			j -= 1;
		}
		arr[j + 1] = key;
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

export default InsertionSort;