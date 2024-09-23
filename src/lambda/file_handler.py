import json
import base64
import boto3
import uuid
import os

s3 = boto3.client('s3')
BUCKET_NAME = os.environ['BUCKET_NAME']  # Bucket name is set as environment variable

def lambda_handler(event, context):
    try:
        # Check if request is base64 encoded (needed for binary uploads)
        is_base64_encoded = event.get("isBase64Encoded", False)
        
        # Read the binary data from the request body
        body = event['body']
        if is_base64_encoded:
            file_content = base64.b64decode(body)  # Decode base64 to binary
        else:
            file_content = body.encode('utf-8')  # Assume it's text
        
        # Generate a unique filename
        file_name = f"{str(uuid.uuid4())}.txt"
        
        # Upload the file to S3
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=file_name,
            Body=file_content
        )
        
        # Prepare success response
        response = {
            "statusCode": 200,
            "body": json.dumps({
                "message": "File uploaded successfully",
                "fileName": file_name
            }),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'HEAD,POST,GET,PUT,DELETE'
            }
        }
        
    except Exception as e:
        # Handle errors
        response = {
            "statusCode": 500,
            "body": json.dumps({
                "message": "Error uploading file",
                "error": str(e)
            }),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'HEAD,POST,GET,PUT,DELETE'
            }
        }
    
    return response