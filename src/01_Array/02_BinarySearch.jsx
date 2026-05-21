import { useEffect, useRef, useState } from 'react';

const DEFAULT_VALUES = '12, 5, 8, 3, 16, 7, 10';
const RUN_DELAY_MS = 1000;

function BinarySearch({ onBack }) {
    const [inputText, setInputText] = useState(DEFAULT_VALUES);
    const [values, setValues] = useState(sortValues(parseArrayInput(DEFAULT_VALUES).values));
    const [targetText, setTargetText] = useState('7');
    const [checked, setChecked] = useState([]);
    const [low, setLow] = useState(0);
    const [high, setHigh] = useState(values.length - 1);
    const [mid, setMid] = useState(null);
    const [foundIndex, setFoundIndex] = useState(null);
    const [status, setStatus] = useState('Press Next Step to start searching.');
    const checkedRef = useRef(checked);
    const lowRef = useRef(low);
    const highRef = useRef(high);
    const foundIndexRef = useRef(foundIndex);
    const valuesRef = useRef(values);
    const runRef = useRef({ timer: null, running: false, target: null });
    useEffect(() => {
        checkedRef.current = checked;
    }, [checked]);

    useEffect(() => {
        lowRef.current = low;
    }, [low]);

    useEffect(() => {
        highRef.current = high;
    }, [high]);

    useEffect(() => {
        foundIndexRef.current = foundIndex;
    }, [foundIndex]);

    useEffect(() => {
        valuesRef.current = values;
        setLow(0);
        setHigh(values.length - 1);
        setMid(parseInt((values.length - 1) / 2));
    }, [values]);

    useEffect(() => () => stopRun(), []);

    const stopRun = () => {
        if (runRef.current.timer) {
            clearTimeout(runRef.current.timer);
            runRef.current.timer = null;
        }
        runRef.current.running = false;
    };

    const resetSearch = () => {
        setChecked([]);
        setLow(0);
        setHigh(valuesRef.current.length - 1);
        setMid(null);
        setFoundIndex(null);
    };

    const handleApplyValues = () => {
        stopRun();
        const parsed = parseArrayInput(inputText).values;
        if (!parsed.length) {
            setStatus('Enter a valid array to visualize.');
            return;
        }
        setValues(sortValues(parsed));
        resetSearch();
        setStatus('Values updated (sorted). Ready to search.');
    };

    const handleRandomize = () => {
        stopRun();
        const length = 8 + Math.floor(Math.random() * 5);
        const randomValues = Array.from({ length }, () => Math.floor(Math.random() * 20) + 1);
        setInputText(randomValues.join(', '));
        setValues(sortValues(randomValues));
        resetSearch();
        setStatus('Random values generated (sorted).');
    };

    const handleStep = () => {
        stopRun();

        const target = parseNumber(targetText);
        const valuesNow = valuesRef.current;

        if (!valuesNow.length || target === null) {
            setStatus('Enter a valid target value.');
            return;
        }

        if (foundIndexRef.current !== null) {
            setStatus(`Target found at index ${foundIndexRef.current}.`);
            return;
        }

        if (lowRef.current > highRef.current) {
            setStatus('Search complete. Target not found.');
            return;
        }

        const nextMid = Math.floor(
            (lowRef.current + highRef.current) / 2
        );

        setMid(nextMid);

        setChecked(prev => [...prev, nextMid]);

        if (valuesNow[nextMid] === target) {
            // setMid(Math.floor(
            //     (lowRef.current + highRef.current) / 2));
            setFoundIndex(nextMid);
            setStatus(`Target found at index ${nextMid}.`);
            return;
        }

        if (valuesNow[nextMid] < target) {
            // setMid(Math.floor(
            //     (lowRef.current + highRef.current) / 2));
            setLow(nextMid + 1);
            setStatus(
                `Target is greater than ${valuesNow[nextMid]}. Searching right...`
            );

            return;
        }
        // setMid(Math.floor(
        //     (lowRef.current + highRef.current) / 2));
        setHigh(nextMid - 1);
        setStatus(
            `Target is less than ${valuesNow[nextMid]}. Searching left...`
        );
    };

    const handleRun = () => {
        const target = parseNumber(targetText);
        const valuesNow = valuesRef.current;
        if (!valuesNow.length || target === null) {
            setStatus('Enter a valid target value.');
            return;
        }
        stopRun();
        runRef.current.running = true;
        runRef.current.target = target;
        setStatus('Running search...');
        runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
    };

    const runStep = () => {
        const valuesNow = valuesRef.current;
        const target = runRef.current.target;
        if (!valuesNow.length || target === null) {
            setStatus('Enter a valid target value.');
            stopRun();
            return;
        }
        if (foundIndexRef.current !== null) {
            setStatus(`Target found at index ${foundIndexRef.current}.`);
            stopRun();
            return;
        }
        if (lowRef.current > highRef.current) {
            setStatus('Search complete. Target not found.');
            stopRun();
            return;
        }

        const nextMid = Math.floor((lowRef.current + highRef.current) / 2);
        setMid(nextMid);
        setChecked([...checkedRef.current, nextMid]);
        if (valuesNow[nextMid] === target) {
            setFoundIndex(nextMid);
            setStatus(`Target found at index ${nextMid}.`);
            stopRun();
            return;
        }

        if (valuesNow[nextMid] < target) {
            setLow(nextMid + 1);
            setStatus(`Target is greater than ${valuesNow[nextMid]}. Searching right...`);
        } else {
            setHigh(nextMid - 1);
            setStatus(`Target is less than ${valuesNow[nextMid]}. Searching left...`);
        }
        runRef.current.timer = setTimeout(runStep, RUN_DELAY_MS);
    };

    const handleReset = () => {
        stopRun();
        resetSearch();
        setStatus('Search reset.');
    };

    return (
        <div className="array-shell">
            <div className="array-card">
                <div className="page-header">
                    <div>
                        <div className="array-title">Binary Search</div>
                        <div className="array-meta">Divide the sorted array in half</div>
                    </div>
                    <button className="back-btn" type="button" onClick={onBack}>
                        Back to Array
                    </button>
                </div>

                <div className="info-grid">
                    <div className="info-card">
                        <h3>What is Binary Search</h3>
                        <p>
                            Binary Search repeatedly divides a sorted array in half to locate the target faster than
                            linear scanning.
                        </p>
                    </div>
                    <div className="info-card">
                        <h3>How Does It Work?</h3>
                        <p>
                            Compare the middle element with the target, then move to the left or right half based on
                            the comparison.
                        </p>
                    </div>
                </div>

                <div className="section-block">
                    <div className="section-title">Algorithm Steps</div>
                    <ol className="steps-list">
                        <li>Sort the array.</li>
                        <li>Set low and high pointers to the array bounds.</li>
                        <li>Find the middle index.</li>
                        <li>Compare the middle value with the target.</li>
                        <li>Adjust the search range until found or exhausted.</li>
                    </ol>
                </div>

                <div className="section-block">
                    <div className="section-title">Time Complexity</div>
                    <div className="complexity-graph">
                        <div className="graph-bar">
                            <span>O(1)</span>
                        </div>
                        <div className="graph-bar active">
                            <span>O(log n)</span>
                        </div>
                        <div className="graph-bar">
                            <span>O(n)</span>
                        </div>
                        <div className="graph-bar">
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
                            <label>Array values (auto-sorted)</label>
                            <input
                                type="text"
                                value={inputText}
                                onChange={(event) => setInputText(event.target.value)}
                                placeholder="e.g. 4, 8, 2, 9"
                            />
                        </div>
                        <div className="control-field">
                            <label>Target</label>
                            <input
                                type="number"
                                value={targetText}
                                onChange={(event) => setTargetText(event.target.value)}
                                placeholder="e.g. 9"
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
                            Run Search
                        </button>
                        <button className="array-btn" type="button" onClick={handleReset}>
                            Reset
                        </button>
                    </div>
                    <div className="array-status">{status}</div>
                    <div className="range-bar">
                        <span className="range-chip range-left">l: {low}</span>
                        <span className="range-chip range-right">r: {high}</span>
                        <span className="range-chip range-mid">mid: {mid === null ? '-' : mid}</span>
                    </div>
                    <div className="viz-array">
                        {values.map((value, index) => (
                            <div
                                key={`${value}-${index}`}
                                className={`viz-cell ${checked.includes(index) ? 'active' : ''} ${foundIndex === index ? 'found' : ''
                                    } ${index < low || index > high ? 'pruned' : ''} ${index === low ? 'range-left' : ''
                                    } ${index === high ? 'range-right' : ''} ${mid !== null && index === mid ? 'range-mid' : ''
                                    }`}
                            >
                                <div className="viz-index">{index}</div>
                                <div className="viz-value">{value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="section-block">
                    <div className="section-title">Implementation Code in C++</div>
                    <pre className="code-block">
                        <code>{`int binarySearch(const vector<int>& arr, int target) {
	int low = 0;
	int high = static_cast<int>(arr.size()) - 1;
	while (low <= high) {
		int mid = (low + high) / 2;
		if (arr[mid] == target) {
			return mid;
		}
		if (arr[mid] < target) {
			low = mid + 1;
		} else {
			high = mid - 1;
		}
	}
	return -1;
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

function parseNumber(text) {
    const value = Number.parseInt(text, 10);
    return Number.isFinite(value) ? value : null;
}

function sortValues(values) {
    return [...values].sort((a, b) => a - b);
}

export default BinarySearch;
