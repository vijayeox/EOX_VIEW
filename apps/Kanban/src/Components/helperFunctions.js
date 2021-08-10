export function itemsHandler(items, id, filter, groupName, setTest, test){

  var ArrayObj = [];

  for(var i = 0; i < items.length; i ++){

    if(items[i].workGroupId === id){

      if(items[i].priority === filter || filter === "All"){

        ArrayObj.push(items[i])

      }

    }

  }
  // var min=(minDate);
 
  // var max=(maxDate);
 

  // for(var i = 0; i < items.length; i ++){

  //   if(items[i].workGroupId === id){
   
  //     if(min === undefined || max=== undefined || min===0){
  //     if((items[i].priority === filter || filter === "All") ){

  //     ArrayObj.push(items[i])
     
  //     }
  //   }else if((items[i].priority === filter || filter === "All") & (items[i].timestamp >=min & items[i].timestamp <= max) ){
  //     ArrayObj.push(items[i])

  //   }
     
  //   }
  //  console.log(ArrayObj.length)
  


  // }
  



  return {responseObj: ArrayObj, objCount: ArrayObj.length};
}

export function checkAllFieldData(Field) {
  // console.log(Field.workGroupName)
  if(Field.workGroupId === null || Field.workGroupId === undefined){
      // console.log("no id")
      return false
  }else if(Field.workGroupName === null || Field.workGroupName === undefined){
      // console.log("no name")
      console.log(Field.workGroupName)
      return false
  }else if(Field.workGroupTitle === null || Field.workGroupTitle === undefined ){
      // console.log("no title")
      return false
  }else{
      // console.log(Field.workGroupName)
      return true
  }
  
} 

export function checkAllFieldDataOfWorkGroup(Field) {

  if(Field.workGroupId === null || Field.workGroupId === undefined){ return false}
  
  else if(Field.workGroupName === null || Field.workGroupName === undefined){ return false }
  
  else if(Field.workGroupTitle === null || Field.workGroupTitle === undefined ){ return false }
  
  else{ return true }

}