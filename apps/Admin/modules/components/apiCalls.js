import osjs from "osjs";
let helper = osjs.make("oxzion/restClient");

export async function DeleteEntry(api, dataItem) {
  let response = await helper.request(
    "v1",
    "/" + api + "/" + dataItem,
    {},
    "delete"
  );
  return response;
}

export async function GetDataSearch(api, term, size) {
  if (term) {
    var query = {
      filter: {
        logic: "and",
        filters: [{ field: "name", operator: "contains", value: term }]
      },
      skip: 0,
      take: size
    };
  } else {
    var query = {
      skip: 0,
      take: size
    };
  }

  let response = await helper.request(
    "v1",
    "/" + api + "?" + "filter=[" + JSON.stringify(query) + "]",
    {},
    "get"
  );
  return response;
}

export async function GetData(api) {
  let response = await helper.request("v1", "/" + api, {}, "get");
  return response;
}

export async function PushData(api, method, item, body) {
  console.log(item);
  if (method == "put") {
    let response = await helper.request(
      "v1",
      "/" + api + "/" + item,
      body,
      method
    );
    return response;
  } else if (method == "post") {
    let response = await helper.request("v1", "/" + api, body, method);
    return response;
  }


}
