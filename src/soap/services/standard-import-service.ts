import StandardApi from "../../rest/standard-api";
import Standard from "../types/standard";
import Norma from "../types/local/norma";
import {transform} from "sucrase";
import ImportService from "../../services/import-service";
import {response} from "express";

class StandardImportRequest {
  constructor() {
  }

}

class StandardImportResponse {
  public list: Norma[];
  public error: boolean = false;
  public errorMessage: string = '';
  constructor(list: any) {
    this.list = []
    for (let key in list) {
      this.list.push(new Norma(list[key]))
    }
  }

  toXml() {
    if (this.list != null && this.error == false) {
      if (this.list.length == 0) {
        return `<info>There no items to import</info>`
      } else {
        let listXml = ''
        for (let key in this.list) {
          listXml += this.list[key].toXml()
        }
        return `<urn:StandardImportResponse>
                <urn:StandardImport>
                    ${listXml}
                </urn:StandardImport>
            </urn:StandardImportResponse>`
      }

    } else {
      return `<error>Bad request: ${this.errorMessage}</error>`
    }

  }
}

export default class StandardImportService {
  buildRequest(req) {
    return new StandardImportRequest()
  }

  async execute(req) {
    let request = this.buildRequest(req)

    const api = new StandardApi()
    const list = await api.list()

    const service = new ImportService()
    const result = await service.execute(list)

    const response = new StandardImportResponse(service.list)
    if (!result) {
      response.error = true
      response.errorMessage = service.errorMessage
    }

    return response

  }


}
