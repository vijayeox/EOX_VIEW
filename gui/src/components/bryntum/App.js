/**
 * Application
 */
import React, { Fragment, useEffect, useRef } from 'react';

import {
    BryntumGantt,
    BryntumResourceHistogram,
    BryntumDemoHeader,
    BryntumThemeCombo,
    BryntumSplitter,
    BryntumButton
} from '@bryntum/gantt-react';

import './App.scss';
import { histogramConfig, ganttConfig } from './AppConfig';

function App() {
    const ganttRef = useRef(null);
    const histogramRef = useRef(null);

    // setup partnership between gantt and histogram
    useEffect(() => {
        histogramRef.current.instance.addPartner(ganttRef.current.instance);
    }, []);

    // Toolbar checkboxes click handler
    const onToolbarAction = (source) => {
        const action = source.dataset.action;
        histogramRef.current.instance[action] = source.checked;
    };

    // Zoom In/Out handler
    const onZoom = ({ source }) => {
        const {
            dataset: { action }
        } = source;
        ganttRef.current.instance[action]();
    };

    return (
        <Fragment>
            <BryntumDemoHeader
                title="React Gantt Resource Histogram demo"
                href="../../../../../#example-frameworks-react-javascript-resource-histogram"
                children={<BryntumThemeCombo />}
            />
            <div className="demo-toolbar align-right" style={{ display: 'none' }}>
                <BryntumButton
                    dataset={{ action: 'zoomIn' }}
                    icon="b-icon-search-plus"
                    tooltip="Zoom in"
                    onAction={onZoom}
                />
                <BryntumButton
                    dataset={{ action: 'zoomOut' }}
                    icon="b-icon-search-minus"
                    tooltip="Zoom out"
                    onAction={onZoom}
                />
            </div>
            <BryntumGantt ref={ganttRef} {...ganttConfig} />
            <BryntumSplitter />
            <BryntumResourceHistogram
                ref={histogramRef}
                extraData={{ onToolbarAction }}
                {...histogramConfig}
            />
        </Fragment>
    );
}

export default App;
