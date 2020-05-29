import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import {updateUserTodo} from './../../businessLogic/todo'




export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const udatedTodo = await updateUserTodo(event)



 return {
   statusCode: 200,
   headers: {
     'Access-Control-Allow-Origin': '*'
   },
   body: JSON.stringify({
    udatedTodo
   })
}


}



