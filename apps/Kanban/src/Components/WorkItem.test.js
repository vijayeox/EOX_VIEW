import React from 'react';
import { shallow, configure,mount } from 'enzyme';

import Adapter from 'enzyme-adapter-react-16';
import WorkItem from './WorkItem';
configure({ adapter: new Adapter() })


describe('Work Item ',()=>{
    const itemData = 
    [
        {
            itemId: 'item-100',
            workGroupId: "uuid1",
            itemName: 'Person-1',
            itemIcon: 'abc',
            itemDescription: 'General Manager',
            timestamp: 1622575446,
            priority: 'High',
            img:'./profile1.jpeg'
        },
    ]
    it('render Correctly',()=>{
        //const store = mockStore(itemData);
        const wrapper=shallow(<WorkItem CardInfo={itemData}/>)
        expect(wrapper).toMatchSnapshot()
    })
    it('Component is not empty',()=>{
        const wrapper=shallow(<work />)
        expect(wrapper.exists()).toBe(true)
    });
    it('props value',()=>{
        const wrapper=shallow(<work   CardInfo={itemData}/>)

        expect(wrapper).toHaveLength(itemData.length)
    })

})

// beforeEach(() => wrapper = shallow(
//     <WorkItem
    
//     />
// ));

// test('render correctly',()=>{
//    // const wrapper=shallow(<WorkItem/>)
//     expect(wrapper.exists()).toBe(true)

// }