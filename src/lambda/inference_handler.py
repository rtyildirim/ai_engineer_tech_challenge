import boto3
import json
import os
from botocore.exceptions import ClientError


VALID_FOCUS_VALUES = {"web", "academic", "math", "writing", "video", "social"}


def invalid_request_response(message):
    return {
        "statusCode": 400,
        "body": json.dumps({"error": message})
    }

def get_validation_error(data):
    if "question" not in data or not isinstance(data["question"], str):
        return "The 'question' field is required and must be a string."

    if "focus" in data:
        if not isinstance(data["focus"], str):
            return "The 'focus' field must be a string if provided."
        if data["focus"].lower() not in VALID_FOCUS_VALUES:
            return "Invalid 'focus' value. Must be one of: {}".format(", ".join(VALID_FOCUS_VALUES))

    if "attachment" in data:
        if not isinstance(data["attachment"], str):
            return "The 'attachment' field must be a string if provided."

    return None

def send_prompt(prompt, focus, temperature=0.5, max_tokens=512):
   
    model_id = os.environ.get('BEDROCK_MODEL_ID')

    native_request = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": max_tokens,
        "temperature": 0.5,
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}],
            },
        ],
    }

    if focus:
        native_request["messages"][0]["content"].append({"type": "text", "text": "Focus: " + focus})

    request = json.dumps(native_request)

    client = boto3.client('bedrock-runtime')

    try:
        response = client.invoke_model(modelId=model_id, body=request)
    except (ClientError, Exception) as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error: {str(e)}")
        }
    
    model_response = json.loads(response["body"].read())

    response_text = model_response["content"][0]["text"]

    return {
        'statusCode': 200,
        'body': json.dumps({
        'question': prompt,
        'focus': focus,
        'response_text': response_text
        })
    }

def lambda_handler(event, context):
    
    if 'body' in event:
        body = event['body']
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            return invalid_request_response('Invalid JSON in request body')
    else:
        return invalid_request_response('No body in request')
    
    validation_error = get_validation_error(data)
    if validation_error:
        return invalid_request_response(validation_error)
    
    question = data['question']
    focus = data.get('focus', '')
    attchment = data.get('attachment', '')

    return send_prompt(question, focus)

