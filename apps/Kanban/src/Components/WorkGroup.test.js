import React from "react";
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'


import work from "./WorkGroup";
import { render } from "react-dom";
configure({ adapter: new Adapter() })
const CardInfo = [
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

describe('Work Group Component',()=>{
    it('renders correctly',()=>{
        const wrapper=shallow(<work/>)
        expect(wrapper).toMatchSnapshot()
          })
    it('Component is not empty',()=>{
        const wrapper=shallow(<work />)
        expect(wrapper.exists()).toBe(true)
    })
    it('Component is not empty',()=>{
        const wrapper=shallow(<work  items={CardInfo}/>)

        expect(wrapper).toHaveLength(CardInfo.length)
    })
    it('First Element',()=>{
        const wrapper=shallow(<work  items={CardInfo}/>)
        
        expect(wrapper).toHaveLength(CardInfo.length)
        console.log('*****!@#***')
        console.log(wrapper.first())
       // expect(wrapper.items.itemId).toEqual('item-10')
    })
    
})