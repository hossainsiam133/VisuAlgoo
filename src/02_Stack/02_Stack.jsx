import { useState } from 'react';
import PushPop from './03_PushPop';
import Postfix from './04_Postfix';
import Prefix from './05_Prefix';
import ArrayImplementation from './06_ArrayImp';

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

function Stack() {
    const [view, setView] = useState('home');

    if (view === 'PushPop') {
        return <PushPop onBack={() => setView('home')} />;
    }

    if (view === 'Postfix') {
        return <Postfix onBack={() => setView('home')} />;
    }

    if (view === 'Prefix') {
        return <Prefix onBack={() => setView('home')} />;
    }

    if (view === 'ArrayImplementation') {
        return <ArrayImplementation onBack={() => setView('home')} />;
    }

    return (
        <div className="array-shell">
            <div className="array-card">
                <div className="array-header">
                    <div className="array-title">Stack</div>
                    {/* <div className="array-meta">Interactive algorithms</div> */}
                </div>

                <div className="section-block">
                    <div className="section-title">Operations</div>
                    <div className="button-row">
                        <button className="array-btn" type="button" onClick={() => setView('PushPop')}>
                            Push & Pop <span className="btn-caret">›</span>
                        </button>
                        {/* <button className="array-btn" type="button" onClick={() => setView('binary')}>
                            Binary Search <span className="btn-caret">›</span>
                        </button> */}
                    </div>
                </div>

                <div className="section-block">
                    <div className="section-title">Polish Notations Evaluation</div>
                    <div className="button-row wrap">
                        <button className="array-btn" type="button" onClick={() => setView('Postfix')}>
                            Postfix <span className="btn-caret">›</span>
                        </button>
                        <button className="array-btn" type="button" onClick={() => setView('Prefix')}>
                            Prefix <span className="btn-caret">›</span>
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

export default Stack;
