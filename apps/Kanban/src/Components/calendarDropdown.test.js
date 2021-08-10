import React from "react";
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'


import CalenderDropDown from "./calendarDropdown";
configure({ adapter: new Adapter() })

describe("CalendarDropdDown", () => {
    const setState = jest.fn();
    const useStateSpy = jest.spyOn(React, 'useState')
    useStateSpy.mockImplementation((init) => [init, setState]);
    it("renders correctly", () => {
        const wrapper = shallow(<CalenderDropDown />);
    
        expect(wrapper).toMatchSnapshot();
       
    });
    it("renders correctly", () => {
        const wrapper = shallow(<CalenderDropDown />);
        const select=wrapper.find('#calendarSelect')
       
        expect(select).toHaveLength(1)
    });
    it(" Select dropdown value should initialize to null", () => {
        // check for initial state
        const wrapper = shallow(<CalenderDropDown />);
        const select=wrapper.find('#calendarSelect')
     
        expect(setState).toBeNull;
      });
      it('start date input and end date and submit button is present in UI',()=>{
        const wrapper=shallow(<CalenderDropDown/>)
        const startinp=wrapper.find("#cal_start_inp")
        const enddate=wrapper.find("#cal_end_inp")
        const submitbutton=wrapper.find('#button')
        expect(startinp.exists()).toBe(true)
        expect(enddate.exists()).toBe(true)
        expect(submitbutton.exists()).toBe(true)
      })
    // it("Select method changes in value in state", () => {
    //     const wrapper = shallow(<CalenderDropDown />);
    //     const select=wrapper.find('#calendarSelect').at(0).simulate('change', {
    //         target: { value: '-7', name: 'range' }
    //     })
      //  expect(setState).toBe(-7);
        
        
     // });
      // it("Initial value of  state in Button click ", () => {
      //   const wrapper = shallow(<CalenderDropDown />);
      //   const select=wrapper.find('buttonClick')
      // expect(setState).toBe(0)
        
        
      // });
     });