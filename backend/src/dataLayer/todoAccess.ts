
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
const logger = createLogger('createTodo')


const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly  s3 = new XAWS.S3({ signatureVersion: 'v4'}),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todoTableIndex = process.env.TODO_ID_INDEX,
        private readonly bucketName = process.env.IMAGES_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION

        ) {

        }

    async getUserTodo(userId: String): Promise<TodoItem[]> {
            const result =  await this.docClient.query({
                TableName: this.todosTable,
                IndexName: this.todoTableIndex,
                KeyConditionExpression: ' userId = :userId',
                ExpressionAttributeValues: {
                  ':userId': userId
                }
              }).promise()
            logger.info(`todo results: ${result.Items}`)
        
            return result.Items as TodoItem[]
    }    

    async createUserTodo(newTodo: TodoItem): Promise<TodoItem> {
        console.log('Storing new item: ', newTodo )
        await this.docClient.put({
         TableName: this.todosTable,
         Item: newTodo
       }).promise()
       logger.info('Attempting to create TOdos')
       return newTodo
    }


    async updateUserTodo(userId:string, todoId: string, newItem: TodoUpdate) {

        var params = {
            TableName: this.todosTable,
            Key:{
              "userId": userId,
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
          const updateItem = this.docClient.update(params).promise()
        
          return updateItem

    }


    async deleteUserTodo(userId:string, todoId: string) {
        var params = {
            TableName: this.todosTable,
            Key:{
              "userId": userId,
              "todoId": todoId
            }
        };
        
          logger.info("Attempting a conditional delete...");
        
          const deleteItem = this.docClient.delete(params).promise()
        
          return deleteItem
    }

    async generateUserUploadUrl(userId:string, todoId: string, attachmentId: string) {

    const url= this.s3.getSignedUrl('putObject',{
            Bucket: this.bucketName,
            Key: attachmentId,
            Expires: this.urlExpiration
          })

    logger.info(`signed url:,${url}`);

    const imageUrl = `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`

    logger.info(`Attempting to Updating attachmentUrl: ${imageUrl} with attachmentID:${attachmentId} on todoId:${todoId} and userId::${userId} `)

    const params ={
      TableName: this.todosTable,
      Key: {
          "userId": userId,
          "todoId": todoId
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
          ":attachmentUrl": imageUrl
      },
      ReturnValues:"UPDATED_NEW"
  }
   await this.docClient.update(params, function(err, data) {
      if (err) {
        logger.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        logger.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      }
    }).promise()

    return url


    }



}