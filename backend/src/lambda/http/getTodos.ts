import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'



const XAWS = AWSXRay.captureAWS(AWS)

const doClient= new XAWS.DynamoDB.DocumentClient()


const todosTable = process.env.TODOS_TABLE

const todoIdIndex = process.env.TODO_ID_INDEX


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  
  const todoId = event.pathParameters.todoId

  const valiTodoId = await todoExisit(todoId)


  if(!valiTodoId) {
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


  const todoItems = await getItemsPerTodo(todoId,todoIdIndex)
  

  if(todoItems.Count != 0) {

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: todoItems.Items[0]
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


async function todoExisit(todoId: string) {

  const result = await doClient
  .get({
    TableName: todosTable,
    Key: {
      id: todoId
    }
  }).promise()

  console.log('Get todo:', result)
  return !!result.Item


}


async function getItemsPerTodo(todoId: string, todoIdIndex: string) {
  const result = await doClient.query({
    TableName: todosTable,
    IndexName: todoIdIndex,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
      ':todoId': todoId
    },
    ScanIndexForward: false
  }).promise()

  return result
}