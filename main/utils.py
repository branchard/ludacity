from django.http import HttpResponse
from django.conf import settings
import json
import uuid
import os

def get_json_data_http_response(data):
    return HttpResponse(json.dumps(data), content_type='application/json; charset=utf-8')

def get_json_from_request(request):
    return json.loads(request.read().decode(request.encoding))

def handle_uploaded_file(f):
    file_name, file_extension = os.path.splitext(f.name.lower())
    unique_file_name = '{0}_{1}{2}'.format(file_name, uuid.uuid4(), file_extension) # generate an unique file name
    destination = open(settings.MEDIA_ROOT + '/' + unique_file_name, 'wb+')
    for chunk in f.chunks():
        destination.write(chunk)
    destination.close()
    file_http_path = '{0}{1}'.format(settings.MEDIA_URL, unique_file_name)
    return file_http_path