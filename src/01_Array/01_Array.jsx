import { useState } from 'react';
import LinearSearch from './01_LinearSearch';
import BinarySearch from './02_BinarySearch';
import BubbleSort from './03_BubbleSort';
import SelectionSort from './04_SelectionSort';
import InsertionSort from './05_InsertionSort';
import MergeSort from './06_MergeSort';

function Array() {
    const [view, setView] = useState('home');

    if (view === 'linear') {
        return <LinearSearch onBack={() => setView('home')} />;
    }

    if (view === 'binary') {
        return <BinarySearch onBack={() => setView('home')} />;
    }

    if (view === 'bubble') {
        return <BubbleSort onBack={() => setView('home')} />;
    }

    if (view === 'selection') {
        return <SelectionSort onBack={() => setView('home')} />;
    }

    if (view === 'insertion') {
        return <InsertionSort onBack={() => setView('home')} />;
    }

    if (view === 'merge') {
        return <MergeSort onBack={() => setView('home')} />;
    }

    return (
        <div className="array-shell">
            <div className="array-card">
                <div className="array-header">
                    <div className="array-title">Array</div>
                    <div className="array-meta">Interactive algorithms</div>
                </div>

                <div className="section-block">
                    <div className="section-title">Searching</div>
                    <div className="button-row">
                        <button className="array-btn" type="button" onClick={() => setView('linear')}>
                            Linear Search <span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('binary')}>
                            Binary Search <span className="btn-caret">›</span>
                        </button>
                    </div>
                </div>

                <div className="section-block">
                    <div className="section-title">Sorting</div>
                    <div className="button-row wrap">
                        <button className="array-btn" type="button" onClick={() => setView('bubble')}>
                            Bubble Sort <span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('selection')}>
                            Selection Sort <span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('insertion')}>
                            Insertion Sort <span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('merge')}>
                            Merge Sort <span className="btn-caret">›</span>
                        </button>
                        {/* <button className="array-btn" type="button">
                            Quick Sort <span className="btn-caret">›</span>
                        </button> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Array;
