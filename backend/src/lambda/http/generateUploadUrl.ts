import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'


import * as uuid from 'uuid';
import * as AWS from 'aws-sdk';
import * as AWSXRay from "aws-xray-sdk";
import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')





const XAWS = AWSXRay.captureAWS(AWS)

const docClient= new XAWS.DynamoDB.DocumentClient()


const todosTable = process.env.TODOS_TABLE


const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const attachmentId = uuid.v4();





  logger.info("Generating upload URL:", {
    todoId: todoId,
    attachmentId: attachmentId
  });

  const geturl = getUploadUrl(attachmentId)
  logger.info(`signed url:,${geturl}`);
  await updateTodoAttachmentUrl(todoId, geturl);



  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${attachmentId}`


  logger.info(`Updating todoId ${todoId} with attachmentID ${attachmentUrl}`)

  await docClient.update({
      TableName: todosTable,
      Key: {
          "todoId": todoId
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
          ":attachmentUrl": attachmentUrl
      }
  })

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: geturl
    })
  }


}



function getUploadUrl(attachmentId: string) {

  return s3.getSignedUrl('putObject',{
    Bucket: bucketName,
    Key: attachmentId,
    Expires: urlExpiration
  })

}



async function updateTodoAttachmentUrl(todoId: string, attachmentUrl: string){

  logger.info(`Updating todoId ${todoId} with attachmentUrl ${attachmentUrl}`)

  await docClient.update({
      TableName: todosTable,
      Key: {
          "todoId": todoId
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
          ":attachmentUrl": attachmentUrl
      }
  }).promise();
}