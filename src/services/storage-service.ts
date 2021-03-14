import fs from 'fs';
import AWS from 'aws-sdk';
import * as path from "path";
import awsmobile from "../aws-exports";
import * as process from "process";

if (typeof (process.env.APP_ENV) !== 'undefined' && process.env.APP_ENV === 'development') {
  const credentials = new AWS.SharedIniFileCredentials({profile: awsmobile.aws_project_profile});

// Set the region and credentials
  AWS.config.update({
    region: awsmobile.aws_project_region,
    credentials: credentials
  });
} else {
  AWS.config.update({
    region: awsmobile.aws_project_region,
  });
}

export default class StorageService {
  private s3Client: any;
  public error: boolean = false;
  public errorMessage: string = '';
  private bucketName: string = '';

  constructor(bucketName:string = null, s3Client = null) {
    if (bucketName == null) {
      bucketName = awsmobile.aws_project_bucket;
    }
    if (s3Client == null) {
      s3Client = new AWS.S3({apiVersion: '2006-03-01'});
    }
    this.s3Client = s3Client;
    this.bucketName =  bucketName
  }

  async read(key:string) {
    let result = null;
    try {
      let params = {Bucket: this.bucketName, Key: key};
      return await this.s3Client.getObject(params).promise()
        .then(response => {
          return response.Body;
        }).catch(error => {
          console.error(error)
          this.error = true
          this.errorMessage = error.message
          return null
        })
    } catch (e) {
      console.error(e)
      this.error = true;
      this.errorMessage = `Unable to read the key ${key} from bucket: ${this.bucketName}`;
    }
    return result
  }

  write(key, data) {
    let result = true;
    // Upload to S3
    let uploadParams = {Bucket: this.bucketName, Key: key, Body: data};
    try {
      result = this.s3Client.upload(uploadParams)
        .promise()
        .then(response => {
          result = true;
          return result
        }).catch(error => {
        console.error(error)
        result = false;
        this.error = true
        this.errorMessage = error.message
        return result

      })
    } catch (e) {
      console.error(e)
      result = false;
      this.error = true;
      this.errorMessage = `Unable to upload the file ${key} to bucket: ${this.bucketName}`;
    }

    return result

  }

  writeInTmp(key, data) {
    let result = true;
    let filePath = path.join('/tmp/', path.basename(key))
    let fileStream = null;
    try {
      fileStream = fs.openSync(filePath, 'w');
      fs.writeSync(fileStream, data);
    } catch (e) {
      console.error(e)
      result = false;
      this.error = true;
      this.errorMessage = `Unable to write a temporary file: ${filePath}`;
    }

    return result
  }
}
