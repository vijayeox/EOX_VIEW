import React from 'react';
import { GridCell } from '@progress/kendo-react-grid';

export default function cellWithEditing(edit, remove) {
    return class extends GridCell {
        render() {
            return (
                <td>
                    <button
                        className="k-primary k-button k-grid-edit-command"
                        onClick={() => { edit(this.props.dataItem); }}
                    >
                        Edit
                    </button>
                    <button
                        className="k-primary k-button k-grid-edit-command"
                        onClick={() => { build(this.props.dataItem); }}
                    >
                        Build
                    </button>
                    &nbsp;
                    <button
                        className="k-button k-grid-remove-command"
                        onClick={() => {
                            confirm('Confirm deleting: ' + this.props.dataItem.ProductName) &&
                                remove(this.props.dataItem);
                        }}
                    >
                        Remove
                    </button>
                </td>
            );
        }
    };
}
