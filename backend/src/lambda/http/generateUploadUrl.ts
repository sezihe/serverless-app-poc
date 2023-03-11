import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { createAttachmentPresignedUrl, updateTodoAttachmentUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import * as crypto from 'crypto';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    

    const userId = getUserId(event);
    const attachmentId = crypto.randomBytes(16).toString('hex');

    const uploadUrl = await createAttachmentPresignedUrl(attachmentId);

    await updateTodoAttachmentUrl(userId, todoId, attachmentId);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

handler
  .use(
    cors({
      credentials: true
    })
  )
