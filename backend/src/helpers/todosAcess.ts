import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { parseUserId } from '../auth/utils'

const XAWS: any = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

    constructor(
      private docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private todosTable = process.env.TODOS_TABLE,
      private todosByUserIndex = process.env.TODOS_BY_USER_INDEX
    ) {}
  
    async todoItemExists(todoId: string, jwtToken: string): Promise<boolean> {
      const userId = parseUserId(jwtToken);
      return !!(await this.getTodoItem(todoId, userId));
    }
  
    async getTodoItems(userId: string): Promise<TodoItem[]> {
      logger.info(`Getting all todos for user ${userId} from ${this.todosTable}`)
  
      const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.todosByUserIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }).promise()
  
      const items = result.Items
  
      logger.info(`Found ${items.length} todos for user ${userId} in ${this.todosTable}`)
  
      return items as TodoItem[]
    }
  
    async getTodoItem(todoId: string, userId): Promise<TodoItem> {
      logger.info(`Getting todo ${todoId} from ${this.todosTable}`)
  
      const result = await this.docClient.get({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      }).promise()
  
      const item = result.Item
  
      return item as TodoItem
    }
  
    async createTodoItem(todoItem: TodoItem) {
      logger.info(`Putting todo ${todoItem.todoId} into ${this.todosTable}`)
  
      await this.docClient.put({
        TableName: this.todosTable,
        Item: todoItem,
      }).promise()
    }
  
    async updateTodoItem(todoId: string, todoUpdate: TodoUpdate, userId: string) {
      logger.info(`Updating todo item ${todoId} in ${this.todosTable}`)
  
      await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          "#name": "name"
        },
        ExpressionAttributeValues: {
          ":name": todoUpdate.name,
          ":dueDate": todoUpdate.dueDate,
          ":done": todoUpdate.done
        }
      }).promise()   
    }
  
    async deleteTodoItem(todoId: string, userId: string) {
      logger.info(`Deleting todo item ${todoId} from ${this.todosTable}. UserId: ${userId}
      `)
  
      await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      }).promise()    
    }
  
    async updateAttachmentUrl(todoId: string, attachmentUrl: string, userId: string) {
      logger.info(`Updating attachment URL for todo ${todoId} in ${this.todosTable}`)
  
      await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      }).promise()
    }
  
}