import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'




import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../../utils/logger'
const logger = createLogger('deleteTodo')


const XAWS = AWSXRay.captureAWS(AWS)

const docClient= new XAWS.DynamoDB.DocumentClient()



const todosTable = process.env.TODOS_TABLE


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  



 await deleteTodo(todoId)



logger.info('sucessfully deleted')

  
return {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify({
    success: "item deleted succesfully"
  })
}


}






async function deleteTodo(todoId: string) {
  
  var params = {
    TableName:todosTable,
    Key:{
      "todoId": todoId
    }
};

  logger.info("Attempting a conditional delete...");

  const deleteItem = docClient.delete(params).promise()

  return deleteItem

}