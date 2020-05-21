import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'



const XAWS = AWSXRay.captureAWS(AWS)

const docClient= new XAWS.DynamoDB.DocumentClient()


const todosTable = process.env.TODOS_TABLE




export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)


  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
 
  const valiTodoId = await todoExisit(todoId)

  if(!valiTodoId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Cannot Update. Todo does not exist'
      })
    }
  }

  
 
  updateTodo(todoId,updatedTodo).then(data => {

    const get_data =  JSON.stringify(data, null, 2)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: `UpdateItem succeeded: ${get_data} `
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
        error: `Unable to update item. Error JSON: ${get_error} `
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





async function updateTodo(todoId: string, newItem: UpdateTodoRequest) {
  
  var params = {
    TableName:todosTable,
    Key:{
      "id": todoId
    },
    UpdateExpression: "set name =:name, dueDate=:dueDate, done=:done",
    ExpressionAttributeValues:{
        ":name":newItem.name,
        ":dueDate":newItem.dueDate,
        ":done":newItem.done
    },
    ReturnValues:"UPDATED_NEW"
};

  console.log("Attempting a conditional delete...");

  const deleteItem = docClient.delete(params).promise()

  return deleteItem

}