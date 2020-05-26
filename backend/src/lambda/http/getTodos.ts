import 'source-map-support/register'
import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { createLogger } from '../../utils/logger'
const logger = createLogger('getTodo')

const XAWS = AWSXRay.captureAWS(AWS)

const doClient= new XAWS.DynamoDB.DocumentClient()


const todosTable = process.env.TODOS_TABLE




export const handler: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  




  const todoItems = await getItemsPerTodo()
  

  if(todoItems.Count != 0) {

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: todoItems.Items
      })
    }

  }
 


  return {
    statusCode: 404,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }



}


async function getItemsPerTodo() {
  const result = await doClient.scan({
    TableName: todosTable
  }).promise()

  logger.info(`todo results: ${result.items}`)
  return result
}