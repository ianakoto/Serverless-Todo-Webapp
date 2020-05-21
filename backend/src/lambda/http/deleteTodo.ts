import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as AWS from 'aws-sdk'




const docClient= new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  
  const valiTodoId = await todoExisit(todoId)

  if(!valiTodoId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Cannot Delete. Todo does not exist'
      })
    }
  }


  deleteTodo(todoId).then(data => {

        const get_data =  JSON.stringify(data, null, 2)
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            error: `DeleteItem succeeded: ${get_data} `
          })
        }

}).catch(err => {

        const get_error =  JSON.stringify(err, null, 2)
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            error: `Unable to delete item. Error JSON: ${get_error} `
          })
        }

  })
  
}



async function todoExisit(todoId: string) {

  const result = await docClient
  .get({
    TableName: todosTable,
    Key: {
      id: todoId
    }
  }).promise()

  console.log('Get todo:', result)
  return !!result.Item


}


async function deleteTodo(todoId: string) {
  
  var params = {
    TableName:todosTable,
    Key:{
      "id": todoId
    }
};

  console.log("Attempting a conditional delete...");

  const deleteItem = docClient.delete(params).promise()

  return deleteItem

}