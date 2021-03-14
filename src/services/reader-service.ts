import StorageService from "./storage-service";
import Norma from "../soap/types/local/norma";
import awsmobile from "../aws-exports";
import TransformService from "./transform-service";

export default class ReaderService {
  private transformService: TransformService;
  get list(): Norma[] {
    return this._list;
  }
  private storageService: StorageService;
  private _list: Norma[];
  private origin: string = '';

  public error: boolean = false;
  public errorMessage: string = '';

  constructor(origin: string = null, storageService: StorageService = null, transformService: TransformService = null) {

    if (storageService == null) {
      storageService = new StorageService();
    }

    if (transformService == null) {
      transformService = new TransformService();
    }

    if (origin == null) {
      origin = awsmobile.aws_project_bucket_mock_key
    }
    this.storageService = storageService;
    this.transformService = transformService;
    this.origin = origin
  }

  async execute() {

    const data = await this.storageService.read(this.origin);
    let list = [];
    let result = {}
    try {
      result = JSON.parse(data)
    } catch (e) {
      console.error(e)
      this.error = true;
      this.errorMessage = e.message
    }

    if (result.hasOwnProperty('norma')) {
      this._list = result['norma'];
    }

    return this._list;
  }
}
