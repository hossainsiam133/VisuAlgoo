import { useState } from 'react';
import SingleList from './05_SingleList.jsx';
import DoubleList from './06_DoubleList.jsx';
import CircularList from './07_CircularList.jsx';
// import ListTraversal from './08_ListTraversal.jsx';
// import ListInsertion from './09_ListInsertion.jsx';
// import ListSearching from './10_ListSearching.jsx';

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
                        Back to Linked List
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

function LinkedList() {
    const [view, setView] = useState('home');

    if (view === 'SingleList') {
        return <SingleList title="Single Linked List" onBack={() => setView('home')} />;
    }

    if (view === 'DoubleList') {
        return <DoubleList title="Doubly Linked List" onBack={() => setView('home')} />;
    }

    if (view === 'CircularList') {
        return <CircularList title="Circular Linked List" onBack={() => setView('home')} />;
    }

    // if (view === 'ListTraversal') {
    //     return <ListTraversal title="List Traversal" onBack={() => setView('home')} />;
    // }

    // if (view === 'ListInsertion') {
    //     return <ListInsertion title="List Insertion" onBack={() => setView('home')} />;
    // }

    // if (view === 'ListSearching') {
    //     return <ListSearching title="List Searching" onBack={() => setView('home')} />;
    // }

    return (
        <div className="array-shell">
            <div className="array-card">
                <div className="array-header">
                    <div className="array-title">Linked List</div>
                    <div className="array-meta">Interactive algorithms</div>
                </div>

                <div className="section-block">
                    <div className="section-title">Types</div>
                    <div className="button-row">
                        <button className="array-btn" type="button" onClick={() => setView('SingleList')}>
                            Single Linked List <span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('DoubleList')}>
                            Doubly Linked List <span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('CircularList')}>
                            Circular Linked List <span className="btn-caret">›</span>
                        </button>
                    </div>
                </div>

                {/* <div className="section-block">
                    <div className="section-title">Operations</div>
                    <div className="button-row wrap">
                        <button className="array-btn" type="button" onClick={() => setView('ListTraversal')}>
                            Traversal <span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('ListInsertion')}>
                            Insertion & Deletion <span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('ListSearching')}>
                            Searching <span className="btn-caret">›</span>
                        </button>
                    </div>
                </div> */}
            </div>
        </div>
    );
}

export default LinkedList;
