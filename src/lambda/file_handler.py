import json
import boto3
import os

s3_client = boto3.client('s3')
BUCKET_NAME = os.environ['BUCKET_NAME']  # Bucket name is set as environment variable

def lambda_handler(event, context):
    try:
        # Parse the request body
        body = json.loads(event['body'])
        file_name = body['fileName']
        file_type = body.get('fileType', 'text/plain')
        
        # Define S3 presigned URL parameters
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': file_name,
                'ContentType': file_type
            },
            ExpiresIn=3600  # URL valid for 1 hour
        )
        
        # Return the presigned URL in response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'uploadUrl': presigned_url,
                'message': 'Presigned URL generated successfully'
            }),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT'
            }
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error generating presigned URL',
                'error': str(e)
            }),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT'
            }
        }
