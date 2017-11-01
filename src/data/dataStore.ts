import * as visjs from "vis"
import {eventBus} from "../util/EventBus";

let testData = [
  {x: '2014-06-11', y: 10},
  {x: '2014-06-12', y: 25},
  {x: '2014-06-13', y: 30},
  {x: '2014-06-14', y: 10},
  {x: '2014-06-15', y: 15},
  {x: '2014-06-16', y: 30}
];


class DataStoreClass {
  state             = new visjs.DataSet(testData);
  temperature       = new visjs.DataSet(testData);
  voltage           = new visjs.DataSet(testData);
  current           = new visjs.DataSet(testData);
  advErrors         = new visjs.DataSet(testData);
  powerUsage        = new visjs.DataSet(testData);
  accumulatedEnergy = new visjs.DataSet(testData);
  advertisements    = new visjs.DataSet(testData);
  iBeacon           = new visjs.DataSet(testData);

  constructor() {
    eventBus.on("data",() => {});
  }
}

export const DataStore = new DataStoreClass();