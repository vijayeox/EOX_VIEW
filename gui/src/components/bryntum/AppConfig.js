/**
 * Application configuration
 */
// import React from 'react';
import { ProjectModel } from '@bryntum/gantt/gantt.umd.js';

// Toolbar
const onAction = ({ source }) => {
    source.up('resourcehistogram').extraData.onToolbarAction(source);
};

const toolbarConfig = {
    cls   : 'histogram-toolbar',
    items : [
        {
            type    : 'checkbox',
            dataset : { action : 'showBarText' },
            text    : 'Show bar texts',
            tooltip : 'Check to show resource allocation in the bars',
            checked : false,
            onAction
        },
        {
            type    : 'checkbox',
            dataset : { action : 'showMaxEffort' },
            text    : 'Show max allocation',
            tooltip : 'Check to display max resource allocation line',
            checked : true,
            onAction
        },
        {
            type    : 'checkbox',
            dataset : { action : 'showBarTip' },
            text    : 'Enable bar tooltip',
            tooltip : 'Check to show tooltips when moving mouse over bars',
            checked : true,
            onAction
        }
    ]
};

// project
const project = new ProjectModel({
    startDate : '2019-01-16',
    endDate   : '2019-02-13',
    transport : {
        load : {
            url : 'data/launch-saas.json'
        }
    },
    autoLoad  : true,
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse : true
});

// Scheduler
const ganttConfig = {
    project,
    dependencyIdField       : 'sequenceNumber',
    //resourceImageFolderPath : 'users/',
    startDate               : '2019-01-11',
    endDate                 : '2019-03-24',
    viewPreset              : 'weekAndDayLetter',
    columnLines             : true,
    labelsFeature           : {
        left : {
            field  : 'name',
            editor : {
                type : 'textfield'
            }
        }
    },
    columns                 : [
        { type : 'name', width : 280 },
        { type : 'resourceassignment', width : 170 }
    ]
};

// Histogram
const histogramConfig = {
    project,
    //resourceImagePath      : 'users/',
    startDate              : '2019-01-11',
    endDate                : '2019-03-24',
    viewPreset             : 'weekAndDayLetter',
    hideHeaders            : true,
    rowHeight              : 50,
    showBarTip             : true,
    scheduleTooltipFeature : false,
    tbar                   : toolbarConfig,
    columns                : [
        { type : 'resourceInfo', field : 'name', showEventCount : false, width : 410 }
    ]
};

export { ganttConfig, histogramConfig };
