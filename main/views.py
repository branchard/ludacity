from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from main.models import *
import json


def index(request):
    # Index dispatcher
    if request.user != None:
        return render(request, 'index.html')
    else:
        bad_login = request.session.get('bad_login', False)
        if bad_login:
            del request.session['bad_login']
        return render(request, 'auth.html', {'bad_login': bad_login})


def disconnect(request):
    request.session.flush()
    return HttpResponseRedirect('.')


def teacher_management(request):
    context_data = dict()
    context_data['active_menu_item'] = 1
    teachers = Teacher.objects.all()
    for teacher in teachers:
        teacher.groups = teacher.groups.all()
    context_data['teachers'] = teachers

    return render(request, 'admin/teacher_management.html', context_data)


# JSON api

def api_teacher_get_all(request):
    data = []
    for teacher in Teacher.objects.all():
        groups = []
        for group in teacher.groups.all():
            groups.append(group.name)
        data.append({
            'first_name': teacher.first_name,
            'last_name': teacher.last_name,
            'groups': groups,
        })
    return HttpResponse(json.dumps(data), content_type='application/json')

def api_teacher_add(request):
    json_data = request.PUT
    data = json.loads(json_data)
    pass