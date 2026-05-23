import { useState } from 'react';
import SingleEndedQueue from './04_SingleEndedQueue.jsx';
import DoubleEndedQueue from './05_DoubleEndedQueue';
import CircularQueue from './06_CircularQueue';
import PriorityQueue from './07_PriorityQueue';
import ArrayImplementation from './08_ArrayImplementation.jsx';
function Placeholder({ title, onBack }) {
    return (
        <div className="array-shell">
            <div className="array-card">
                <div className="page-header">
                    <div>
                        <div className="array-title">{title}</div>
                        <div className="array-meta">Module under construction</div>
                    </div>
                    <button className="back-btn" type="button" onClick={onBack}>
                        Back to Stack
                    </button>
                </div>
                <div className="info-card">
                    <h3>Coming Soon</h3>
                    <p>This visualization will be added next.</p>
                </div>
            </div>
        </div>
    );
}

function Queue() {
    const [view, setView] = useState('home');

    if (view === 'SingleEndedQueue') {
        return <SingleEndedQueue onBack={() => setView('home')} />;
    }

    if (view === 'DoubleEndedQueue') {
        return <DoubleEndedQueue onBack={() => setView('home')} />;
    }

    if (view === 'CircularQueue') {
        return <CircularQueue onBack={() => setView('home')} />;
    }
    if (view === 'PriorityQueue') {
        return <PriorityQueue onBack={() => setView('home')} />;
    }

    if (view === 'ArrayImplementation') {
        return <ArrayImplementation onBack={() => setView('home')} />;
    }

    return (
        <div className="array-shell">
            <div className="array-card">
                <div className="array-header">
                    <div className="array-title">Queue</div>
                    {/* <div className="array-meta">Interactive algorithms</div> */}
                </div>

                <div className="section-block">
                    <div className="section-title">Types</div>
                    <div className="button-row">
                        <button className="array-btn" type="button" onClick={() => setView('SingleEndedQueue')}>
                            Single Ended Queue <span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('DoubleEndedQueue')}>
                            Double Ended Queue<span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('CircularQueue')}>
                            Circular Queue<span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('PriorityQueue')}>
                            Priority Queue<span className="btn-caret">›</span>
                        </button>
                    </div>
                </div>

                <div className="section-block">
                    <div className="section-title">Implementation</div>
                    <div className="button-row wrap">
                        <button className="array-btn" type="button" onClick={() => setView('ArrayImplementation')}>
                            Using Array <span className="btn-caret">›</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Queue;
