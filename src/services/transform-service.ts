import StorageService from "./storage-service";
import Norma from "../soap/types/local/norma";
import Standard from "../soap/types/standard";
import awsmobile from "../aws-exports";

export default class TransformService {

  public transformList(standardList) {
    let list: Norma[] = [];
    let i = 1;
    for (let key in standardList) {
      const item = standardList[key] as Standard;
      const norma = this.transform(i++, item);
      list.push(norma)
    }

    return list
  }

  public transform(id: number, item: Standard) {
    const map = {
      "norma_id": id,
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
    return new Norma(map)
  }
}
