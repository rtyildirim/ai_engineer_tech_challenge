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

    if "previousQuestion" in data:
        if not isinstance(data["previousQuestion"], str):
            return "The 'previousQuestion' field must be a string if provided."
        if "previousAnswer" not in data:
            return "The 'previousAnswer' field is required when 'previousQuestion' is provided."

    if "previousAnswer" in data:
        if not isinstance(data["previousAnswer"], str):
            return "The 'previousAnswer' field must be a string if provided."
        if "previousQuestion" not in data:
            return "The 'previousQuestion' field is required when 'previousAnswer' is provided."

    return None

def construct_prompt(question, focus=None):

    base_prompt = f"Answer the following question: '{question}'"

    if focus:
        focus_options = {
            "web": "Use information from the web to provide an answer.",
            "academic": "Provide an academic explanation with sources if possible.",
            "math": "Solve the question using mathematical concepts.",
            "writing": "Give a detailed answer with a focus on writing style and structure.",
            "video": "Provide an answer as if explaining in a video format.",
            "social": "Focus on the social context and give an answer based on societal perspectives."
        }

        focus_instruction = focus_options.get(focus.lower(), "")
        if focus_instruction:
            base_prompt += f" \n{focus_instruction}"

    return base_prompt



def get_follow_up_prompt(question, previous_question, previous_answer, focus = None):

    prompt = (
        f"Original question: {previous_question}\n"
        f"Model's previous answer: {previous_answer}\n"
        f"Follow-up question: {question}\n"
        f"Please provide an updated response."
    )

    return construct_prompt(prompt)


def send_prompt(question, prompt, focus, temperature=0.5, max_tokens=512):
   
    model_id = os.environ.get('BEDROCK_MODEL_ID')

    print(prompt)

    native_request = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": max_tokens,
        "temperature":temperature,
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
        'question': question,
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

    prompt = construct_prompt(question, focus)

    if "previousQuestion" in data and "previousAnswer" in data:
        previous_question = data["previousQuestion"]
        previous_question = data["previousAnswer"]
        prompt = get_follow_up_prompt(question, previous_question, previous_question, focus)

    return send_prompt(question, prompt, focus)

