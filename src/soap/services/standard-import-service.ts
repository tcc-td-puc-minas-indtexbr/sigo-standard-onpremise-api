import StandardApi from "../../rest/standard-api";
import Standard from "../types/standard";
import Norma from "../types/local/norma";
import {transform} from "sucrase";

class StandardImportRequest {
  constructor() {
  }

}

class StandardImportResponse {
  public list: Norma[];
  constructor(list: any) {
    this.list = []
    for (let key in list) {
      this.list.push(new Norma(list[key]))
    }
  }

  toXml() {
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
}

export default class StandardImportService {
  buildRequest(req) {
    return new StandardImportRequest()
  }

  async execute(req) {
    let request = this.buildRequest(req)

    const api = new StandardApi()
    const list = await api.list()
    const normaList = this.transform(list)
    return new StandardImportResponse(normaList)

  }

  transform(standardList) {
    let list: Norma[] = [];
    let i = 1;
    for (let key in standardList) {
      const item = standardList[key] as Standard;
      const map = {
        "norma_id": i++,
        "codigo": item.identification,
        "data_publicacao": item.publication_date,
        "validade": item.validity_start,
        "titulo": item.title,
        "comite": item.comite,
        "status": item.status,
        "idioma": item.language,
        "organizacao": item.organization,
        "preco": item.price,
        "moeda": item.currency,
        "objetivo": item.objective,
        "link": item.url,
        "arquivo": item.file

      }
      list.push(new Norma(map))
    }

    return list
  }
}
