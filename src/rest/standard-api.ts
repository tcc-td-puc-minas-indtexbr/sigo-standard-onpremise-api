import axios from 'axios'
import {response} from "express";
export default class StandardApi {
  private host: string;
  private headers: { "X-API-KEY": string };

  constructor() {
    this.host = 'https://services.hagatus.com.br/sigo-standard/v1'
    this.headers = {
      'X-API-KEY': '18dba4ea56a359b1d050dc72751d74907f4cb5e7c0128305626a58df3c6232be'
    }
    for (let header in this.headers) {
      axios.defaults.headers.common[header] = this.headers[header]
    }

  }

  public async list() {
    console.log(`${this.host}/standard`)
    return await axios.get(`${this.host}/standard`)
      .then(response => {

        if (response.data.hasOwnProperty('data')) {
          return response.data.data
        }
        return []
      }).catch(error => {
        console.log(error)
        return []
      })
  }
  public get(uuid) {

  }

}
