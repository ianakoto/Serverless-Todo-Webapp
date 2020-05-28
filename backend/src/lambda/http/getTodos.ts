import 'source-map-support/register'
import { APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayEvent } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { decode } from 'jsonwebtoken'

import { JwtPayload } from './../../auth/JwtPayload'
import { createLogger } from '../../utils/logger'
const logger = createLogger('getTodo')

const XAWS = AWSXRay.captureAWS(AWS)

const doClient= new XAWS.DynamoDB.DocumentClient()


const todosTable = process.env.TODOS_TABLE
const todoTableIndex = process.env.TODO_ID_INDEX



export const handler: APIGatewayProxyHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  logger.info(`todo get body: ${JSON.parse(event.body)}`)

  const authHeader = event.headers.Authorization
  const authSplit = authHeader.split(" ")
  const userId = parseUserId(authSplit[1])



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





/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}