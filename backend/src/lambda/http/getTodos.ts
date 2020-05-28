import 'source-map-support/register'
import { APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayEvent } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { createLogger } from '../../utils/logger'
const logger = createLogger('getTodo')

const XAWS = AWSXRay.captureAWS(AWS)

const doClient= new XAWS.DynamoDB.DocumentClient()


const todosTable = process.env.TODOS_TABLE
const todoTableIndex = process.env.TODO_ID_INDEX



export const handler: APIGatewayProxyHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  logger.info(`todo get body: ${JSON.parse(event.body)}`)
  const userId = event.pathParameters.userId



  const todoItems = await getItemsPerTodo(userId)
  

  if(todoItems.Count != 0) {

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item: todoItems.Items
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


async function getItemsPerTodo(userId: String) {
  const result = await doClient.query({
    TableName: todosTable,
    IndexName: todoTableIndex,
    KeyCOnditionExpression: ' userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  }).promise()

  logger.info(`todo results: ${result.items}`)
  return result
}