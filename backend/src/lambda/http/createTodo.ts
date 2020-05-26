import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import {getUserIdFromEvent} from "../../auth/utils";
import * as AWS from 'aws-sdk'


import * as uuid from 'uuid';

import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../../utils/logger'
const logger = createLogger('createTodo')


const XAWS = AWSXRay.captureAWS(AWS)

const doClient= new XAWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item
  const todoId = uuid.v4();
  const userId = getUserIdFromEvent(event);
  const createdAt= new Date().toISOString()


  const newTodoWithAdditionalInfo = {
      userId: userId,
      todoId: todoId,
      createdAt:createdAt,
      ...newTodo
  }




  logger.info(`Todo new Item: ${newTodoWithAdditionalInfo}`) 
  const todonewItems = await creatTodo(newTodoWithAdditionalInfo)
  

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: todonewItems
    })
  }



}



async function creatTodo( newTodo: CreateTodoRequest) {
 
 
  console.log('Storing new item: ', newTodo )
   await doClient.put({
    TableName: todosTable,
    Item: newTodo
  }).promise()
  logger.info('Attempting to create TOdos')
  return newTodo
}


