

import React from 'react'
import {Form,Row,Col} from 'react-bootstrap';
export default function JSONToHTMLForm(props){
    const {data,stack,handleFormChange} = props
    return (
            <>
                {Object.keys(data).map((k) => (
                    <div  style={!(Array.isArray(data) || (data[k] && typeof data[k] === 'object')) ? {margin:'10px'}:{margin:'10px',border:'1px solid lightgray'}}>
                        {!Array.isArray(data) && (data[k] && typeof data[k] === 'object') ?
                                isNaN(parseInt(k)) &&
                                    <p style={{margin:'10px'}}>{k}</p>:null
                        }
                        {(() => {
                            if (data[k] && typeof data[k] === 'object') {
                                return (
                                    <JSONToHTMLForm data={data[k]} handleFormChange={handleFormChange} stack={stack.concat(k)}/>
                                )
                            }
                            return (
                                <Form.Group as={Row} style={{marginLeft:"4px"}}>
                                    <Form.Label column sm={3}>
                                        {k}
                                    </Form.Label>
                                    <Col sm={6}>
                                        <Form.Control 
                                            type="text"
                                            value={data[k]}
                                            onChange={(e) => {handleFormChange(stack.concat(k),e)}}
                                        />
                                    </Col>
                                </Form.Group>
                            )
                        })()}
                    </div>
                ))}
            </>     
    )
}