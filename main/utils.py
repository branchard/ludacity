from django.http import HttpResponse
import json

def get_json_data_http_response(data):
    return HttpResponse(json.dumps(data), content_type='application/json; charset=utf-8')