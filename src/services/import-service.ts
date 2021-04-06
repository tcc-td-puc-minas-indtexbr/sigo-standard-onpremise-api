import StorageService from "./storage-service";
import Norma from "../soap/types/local/norma";
import Standard from "../soap/types/standard";
import awsmobile from "../aws-exports";
import TransformService from "./transform-service";
import ReaderService from "./reader-service";

export default class ImportService {

  private storageService: StorageService;
  private transformService: TransformService;
  private readerService: ReaderService;
  private _currentList: Norma[];
  private _list: Norma[];
  private destination: string = '';
  public error: boolean = false;
  public errorMessage:string = '';

  constructor(destination: string = null,
              storageService: StorageService = null,
              transformService:TransformService = null,
              readerService:ReaderService = null) {

    if (storageService == null) {
      storageService = new StorageService();
    }

    if (transformService == null) {
      transformService = new TransformService();
    }

    if (readerService == null) {
      readerService = new ReaderService();
    }

    if (destination == null) {
      destination = awsmobile.aws_project_bucket_mock_key
    }

    this.storageService = storageService;
    this.transformService = transformService;
    this.readerService = readerService;
    this.destination = destination

  }

  get currentList(): Norma[] {
    return this._currentList;
  }
  get list(): Norma[] {
    return this._list;
  }

  async execute(apiListData: any) {

    const storageList = await this.readerService.execute();
    const filteredList = this.filter(apiListData, storageList)
    const mergedList = this.merge(filteredList, storageList)

    const result = this.import(filteredList, mergedList);
    if (result == false) {
      this.error = true;
      this.errorMessage = 'Unable to import data'
    }
    if (filteredList.length == 0) {
      this.error = false;
      this.errorMessage = 'Nothing to import'
    }

    this._list = filteredList

    return result;
  }

  private import(filteredList:Norma[], mergedList: Norma[]) {
    let result = true;
    if (filteredList.length > 0) {
      const jsonObject = {
        norma: mergedList
      }
      const jsonData = JSON.stringify(jsonObject)
      result = this.storageService.write(this.destination, jsonData)
    }

    return result;
  }

  private getLastId(storageList: Norma[]) {
    let lastId = 0;
    if (storageList && storageList.length > 0) {

      for (const key in storageList) {
        const item = storageList[key]
        const id = item['norma_id']
        if (id > lastId) {
          lastId = id
        }
      }
    }

    return lastId
  }

  private filter(apiListData: Standard[], storageList: Norma[]) {
    let newItems:Norma[] = [];
    let storageIdentifications = {};
    let apiIdentifications = {};

    let lastId = this.getLastId(storageList);

    for(const key in storageList) {
      const item = storageList[key]
      storageIdentifications[item['codigo']] = item;
    }

    for(const key in apiListData) {
      const item = apiListData[key]
      const idKey = item['identification']
      apiIdentifications[idKey] = item;

      let storageKeys = Object.keys(storageIdentifications)
      if (storageKeys.indexOf(idKey) == -1) {
        const norma = this.transformService.transform(++lastId, item)
        newItems.push(norma)
      }
    }
    return newItems
  }

  private merge(filteredList: Norma[], storageList: Norma[]) {
    if (Array.isArray(storageList)) {
      return storageList.concat(filteredList)
    }
    return filteredList;
  }
}
