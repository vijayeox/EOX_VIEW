export function scrollDashboardToTop() {
  document.getElementById("page-content").scrollTo(0, 0)
}

export function preparefilter(filter1, filter2) {
  var filter = []
  filter.push(filter1)
  filter.push("AND")
  filter.push(filter2)
  return filter
}
//preparing filter for frontend :setting filter options and applied options
export function replaceCommonFilters(parentFilters, childFilters, property) {
  if (parentFilters && parentFilters.length > 0) {
    if (childFilters.length > 0) {
      let appliedFilters = []
      let optionalfilters = []
      let parentFilterCopy = JSON.parse(JSON.stringify(parentFilters))
      let childFilterCopy = JSON.parse(JSON.stringify(childFilters))
      for (let parentindex = parentFilterCopy.length - 1; parentindex >= 0; parentindex--) {
        let hasCommonFilter = 0
        for (let childIndex = childFilterCopy.length - 1; childIndex >= 0; childIndex--) {
          if (parentFilterCopy.length > 0 && childFilterCopy.length > 0) {
            if (parentFilterCopy[parentindex].field == childFilterCopy[childIndex].field) {
              hasCommonFilter += 1
              appliedFilters.push(childFilterCopy[childIndex])
              childFilterCopy.splice(childIndex, 1)
              parentFilterCopy.splice(parentindex, 1)
              parentindex--
            }
          }
        }
        if (hasCommonFilter == 0) {
          appliedFilters.push(parentFilterCopy[parentindex])
        }
      }
      if (childFilters.length > 0) {
        childFilters.map((childFilterValue, index) => {

          optionalfilters.push(childFilterValue.label ? childFilterValue : { label: childFilterValue.filterName, value: childFilterValue })
        })
      }
      return property == "filterConfiguration" ? appliedFilters : optionalfilters
    } else {
      return property == "filterConfiguration" ? parentFilters : []
    }
  } else {
    if (parentFilters.length == 0) {
      if (property == "filterConfiguration") {
        return []
      } else {
        if (childFilters.length > 0) {
          let optionalfilters = []
          childFilters.map((childFilterValue, index) => {
            optionalfilters.push(childFilterValue.label ? childFilterValue : { label: childFilterValue.filterName, value: childFilterValue })
          })
          return optionalfilters
        }
        return []
      }
    }
  }
}

export function showDashboard(isVisible) {
  var element = document.getElementById("dashboard-editor-div");
  if (isVisible) {
    element != undefined && element.classList.remove("hide-dash-editor")
  } else {
    element != undefined && element.classList.add("hide-dash-editor")
  }
}

//preparing filter for backend
export function overrideCommonFilters(parentFilter, childFilter) {
  let filter = []
  let parentFilterCopy = JSON.parse(JSON.stringify(parentFilter))
  let childFilterCopy = JSON.parse(JSON.stringify(childFilter))
  for (let parentindex = parentFilterCopy.length - 1; parentindex >= 0; parentindex--) {
    let hasCommonFilter = 0
    for (let childIndex = childFilterCopy.length - 1; childIndex >= 0; childIndex--) {
      if (parentFilterCopy[parentindex].field == childFilterCopy[childIndex].field) {
        hasCommonFilter += 1
        filter.push(childFilterCopy[childIndex])
        childFilterCopy.splice(childIndex, 1)
        parentFilterCopy.splice(parentindex, 1)
        parentindex--
      }
    }
    if (hasCommonFilter == 0) {
      filter.push(parentFilterCopy[parentindex])
      parentFilterCopy.splice(parentindex, 1)
    }
  }
  let remainingFilter = []
  if ((parentFilterCopy && parentFilterCopy.length != 0) && (childFilterCopy && childFilterCopy.length != 0)) {
    remainingFilter = [...parentFilter, ...childFilterCopy]
  } else if (parentFilterCopy && parentFilterCopy.length != 0) {
    remainingFilter = [...parentFilterCopy]
  } else if (childFilterCopy && childFilterCopy.length != 0) {
    remainingFilter = [...childFilterCopy]
  }
  if (remainingFilter.length != 0) {
    filter = [...filter, ...remainingFilter]
  }
  return filter
}

export function extractFilterValues(dashboardFilter, dashboardStack, filtermode) {
  //filtermode is set to edfault if filters are applied by default
  filtermode = filtermode || "applied"
  let filterParams = []
  dashboardFilter.map((filter, index) => {
    let filterarray = []
    //extract only default filter values if it is the first dashboard. else extract all filters
    if ((dashboardStack.length <= 1 && filter.isDefault == true) || (dashboardStack.length > 1 || filtermode == "applied")) {
      if (filter["dataType"] == "date") {
        var startDate = filter["startDate"]
        var endDate = null
        //extract the first option from date fields
        // if(Array.isArray(filter["field"])){
        //   //set default value as first option value
        //   if(!filter["field"].hasOwnProperty("selected"))
        //     filter["field"]["selected"]=filter["field"][0]["value"]
        //  }
        if (filter["operator"] === "today") {
          filter["operator"] = "=="
        }
        if (filter["operator"] === "monthly" || filter["operator"] === "yearly") {
          filter["operator"] = "gte&&lte"
        }
        if (filter["startDate"] && filter["endDate"]) {
          //convert startDate object to string
          if (typeof startDate !== "string") {
            startDate = filter["startDate"]
            startDate = "date:" + startDate.getFullYear() + "-" + (("0" + (startDate.getMonth() + 1)).slice(-2)) + "-" + (("0" + startDate.getDate()).slice(-2))
          } else if (new Date(startDate)) {
            startDate = new Date(filter["startDate"])
            startDate = "date:" + startDate.getFullYear() + "-" + (("0" + (startDate.getMonth() + 1)).slice(-2)) + "-" + (("0" + startDate.getDate()).slice(-2))
          }

          //date range received
          if (filter["operator"] == "gte&&lte" || filter["operator"] === "mtd" || filter["operator"] === "ytd") {
            endDate = filter["endDate"]

            if (filter["operator"] == "gte&&lte") {
              if (typeof endDate !== "string") {
                endDate = "date:" + endDate.getFullYear() + "-" + (("0" + (endDate.getMonth() + 1)).slice(-2)) + "-" + (("0" + endDate.getDate()).slice(-2))
              } else if (new Date(endDate)) {
                endDate = new Date(endDate)
                endDate = "date:" + endDate.getFullYear() + "-" + (("0" + (endDate.getMonth() + 1)).slice(-2)) + "-" + (("0" + endDate.getDate()).slice(-2))
              }
            } else {
              //get current date values
              startDate = new Date()
              endDate = new Date()
              if (filter["operator"] === "mtd") {
                startDate = "date:" + startDate.getFullYear() + "-" + (("0" + (startDate.getMonth() + 1)).slice(-2)) + "-" + ("01")
              }
              else if (filter["operator"] === "ytd") {
                startDate = "date:" + startDate.getFullYear() + "-" + ("01") + "-" + ("01")
              }
              endDate = "date:" + endDate.getFullYear() + "-" + (("0" + (endDate.getMonth() + 1)).slice(-2)) + "-" + (("0" + endDate.getDate()).slice(-2))
              // filter["operator"] = "gte&&lte"
            }



            //prepare startDate array
            filterarray.push(filter["field"])
            filterarray.push(">=")
            filterarray.push(startDate)
            filterParams.push(filterarray)


            //prepare endDate array
            filterarray = []
            filterarray.push(filter["field"])
            filterarray.push("<=")
            filterarray.push(endDate)
            filterParams.push(filterarray)
          } else {
            //if date is not a range
            filterarray = []
            filterarray.push(filter["field"])
            filterarray.push(filter["operator"])
            if (typeof startDate !== "string") {
              startDate = filter["startDate"]
              startDate = "date:" + startDate.getFullYear() + "-" + (("0" + (startDate.getMonth() + 1)).slice(-2)) + "-" + (("0" + startDate.getDate()).slice(-2))
            } else if (new Date(startDate)) {
              startDate = new Date(filter["startDate"])
              startDate = "date:" + startDate.getFullYear() + "-" + (("0" + (startDate.getMonth() + 1)).slice(-2)) + "-" + (("0" + startDate.getDate()).slice(-2))
            }
            filterarray.push(startDate)
            filterParams.push(filterarray)

          }
        } else {
          //single date passed
          filterarray.push(filter["field"])
          filterarray.push(filter["operator"])
          if (typeof startDate !== "string") {
            startDate = filter["startDate"]
            startDate = "date:" + startDate.getFullYear() + "-" + (("0" + (startDate.getMonth() + 1)).slice(-2)) + "-" + (("0" + startDate.getDate()).slice(-2))
          } else if (new Date(startDate)) {
            startDate = new Date(filter["startDate"])
            startDate = "date:" + startDate.getFullYear() + "-" + (("0" + (startDate.getMonth() + 1)).slice(-2)) + "-" + (("0" + startDate.getDate()).slice(-2))
          }
          filterarray.push(startDate)
          filterParams.push(filterarray)
        }
      } else {
        filterarray.push(filter["field"])
        filterarray.push(filter["operator"])
        filterarray.push(filter["value"])
        filterParams.push(filterarray)
        // if (filter["value"].hasOwnProperty("selected")) {
        //   filterParams.push(filterarray)
        // }
      }
    }
  })
  return filterParams
}