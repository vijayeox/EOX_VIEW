class WidgetTransformer {
  static transform(configuration, data) {
    let oxzionMeta = configuration["oxzion-meta"];
    if (oxzionMeta) {
      let type = oxzionMeta["type"];
      if (!type) {
        type = "";
      }
      type = type.toUpperCase();
      switch (type) {
        case "STACKED-BAR":
          return WidgetTransformer._transformStackedGraph(configuration, data);
      }
    }

    //Return as-it-is if none of the above conditions are met.
    return {
      chartConfiguration: configuration,
      chartData: data,
    };
  }

  static _transformStackedGraph(configuration, data) {
    let oxzionMeta = configuration["oxzion-meta"];
    let dataSet = oxzionMeta["dataSet"];
    if (!dataSet) {
      throw 'oxzion-meta configuration should have "dataSet" object.';
    }
    let dataSetCategory = dataSet["category"];
    if (!dataSetCategory) {
      throw '"dataSet" configuration should have "category" object.';
    }
    let dataSetSeries = dataSet["series"];
    if (!dataSetSeries) {
      throw '"dataSet" configuration should have "series" object.';
    }

    let chartSeries = configuration["series"];
    if (!chartSeries) {
      throw '"series" object not found in chart configuration.';
    }
    if (!Array.isArray(chartSeries)) {
      throw "Chart series should be array.";
    }
    if (0 === chartSeries.length) {
      throw "Chart series is empty.";
    }

    let chartSeriesTemplate = JSON.stringify(chartSeries[0]);
    let chartData = [];
    let dataMap = {};
    let newSeriesMap = {};
    let newSeriesArray = [];
    data.forEach(function (value, index, array) {
      let key = value[dataSetCategory];
      let obj = dataMap[key];
      if (!obj) {
        obj = {};
        obj[dataSetCategory] = key;
        chartData.push(obj);
        dataMap[key] = obj;
      }
      let seriesName = value[dataSetSeries["name"]];
      obj[seriesName] = value[dataSetSeries["value"]];

      //Do this only if this series name is not done earlier.
      if (!newSeriesMap[seriesName]) {
        let seriesConfig = JSON.parse(chartSeriesTemplate.replace(/\{SERIES_NAME\}/g, seriesName));
        seriesConfig["stacked"] = true;
        newSeriesMap[seriesName] = "done";
        newSeriesArray.push(seriesConfig);
      }
    });
    //Overwrite chart series configuration from the transformed and expanded series.
    configuration["series"] = newSeriesArray;
    //Remove oxzion-meta object.
    if (configuration["oxzion-meta"]) {
      if (configuration["oxzion-meta"]["drillDown"]) {
        //clean the oxzion-meta contents except the drillDown element
        var drilldown = configuration["oxzion-meta"]["drillDown"];
        delete configuration["oxzion-meta"];
        configuration["oxzion-meta"] = { drillDown: drilldown };
      } else {
        delete configuration["oxzion-meta"];
      }
    }

    return {
      chartConfiguration: configuration,
      chartData: chartData,
    };
  }
}

export default WidgetTransformer;
