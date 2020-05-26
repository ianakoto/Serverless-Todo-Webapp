import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { createLogger } from '../../utils/logger'
const logger = createLogger('updateTodo')

const XAWS = AWSXRay.captureAWS(AWS)

const docClient= new XAWS.DynamoDB.DocumentClient()


const todosTable = process.env.TODOS_TABLE




export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)


  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object

  
 
 await updateTodo(todoId,updatedTodo)


 return {
   statusCode: 200,
   headers: {
     'Access-Control-Allow-Origin': '*'
   },
   body: JSON.stringify({
     updatedTodo
   })
}


}




async function updateTodo(todoId: string, newItem: UpdateTodoRequest) {
  
  var params = {
    TableName:todosTable,
    Key:{
      "todoId": todoId
    },
    UpdateExpression: "set #todoName =:name, dueDate=:dueDate, done=:done",
    ExpressionAttributeNames: {
      "#todoName": "name"
  },
    ExpressionAttributeValues:{
        ":name":newItem.name,
        ":dueDate":newItem.dueDate,
        ":done":newItem.done
    },
    ReturnValues:"UPDATED_NEW"
};

  logger.info("Attempting a conditional update...")
  const updateItem = docClient.update(params).promise()

  return updateItem

}
