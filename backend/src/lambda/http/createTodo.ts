import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import * as AWS from 'aws-sdk'



const doClient= new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item
  const todoId = event.pathParameters.todoId
  const createdAt= new Date().toISOString()

  const  newItem = {
        todoId,
        createdAt,
        ...newTodo
        


      }



  
  const valiGroupId = await todoExisit(todoId)




  if(!valiGroupId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }


  const todonewItems = await creatTodo(newItem)
  

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



async function todoExisit(todoId: string) {

  const result = await doClient
  .get({
    TableName: todosTable,
    Key: {
      id: todoId
    }
  }).promise()

  console.log('Get group:', result)
  return !!result.Item


}


async function creatTodo( newTodo: CreateTodoRequest) {
 
 
  console.log('Storing new item: ', newTodo )
   await doClient.put({
    TableName: todosTable,
    Item: newTodo
  }).promise()

  return newTodo
}