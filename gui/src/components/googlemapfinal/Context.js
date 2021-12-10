import React,{useContext,useState} from "react";

import {Data} from "./Data";
import "./App.css"

const PersonContext=React.createContext();

const Context=()=>{
    const [people,setPeople]=useState(Data)
    const removeItem=(id)=>{
        setPeople((people)=>{
            return people.filter((person)=>person.id !==id)
        })
    }
    const[names,setNames]=useState("Sumukh")

//     return(
//         <>
//         <h1>Context API Example</h1>
//         <List people={people} removeItem={removeItem}/>
//         </>
//     )
// }
//  const List=({people,removeItem})=>{
//      console.log(people)
//      return(
//          <>
//          {people.map((person)=>{
//              return(
//             //  <h4>{person.name}</h4>
             
//              <SinglePerson key={person.id} {...person} removeItem={removeItem}/>
//              )
//          })}
//          </>

//      )

//  }
//  const SinglePerson=({id,name,removeItem})=>{
//      console.log(name)
//      return(
//          <>
//          <div className='item'>
//              <h4>{name}</h4>
//              <button onClick={()=>removeItem(id)}>Remove</button>

//          </div>
//          </>
//      )

//  }
return(
    <PersonContext.Provider value={{removeItem,names}}>
    <h1>Context API Example</h1>
    <List people={people} removeItem={removeItem}/>
    </PersonContext.Provider>
)
}
const List=({people})=>{
 console.log(people)
 return(
     <>
     {people.map((person)=>{
         return(
        //  <h4>{person.name}</h4>
         
         <SinglePerson key={person.id} {...person} />
         )
     })}
     </>

 )

}
const SinglePerson=({id,name})=>{
 console.log(name)
 const {removeItem,names}=useContext(PersonContext)
 console.log(removeItem,names)
 return(
     <>
     <div className='item'>
         <h4>{name}</h4>
         <button className='btn' onClick={()=>removeItem(id)}>Remove</button>

     </div>
     </>
 )

}


 export default Context
