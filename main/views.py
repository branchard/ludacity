# -*- coding:utf-8 -*-
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

def api_teacher_get(request):
    if request.is_ajax() and request.method == 'GET' and request.GET.get('id') != None:
        id = request.GET.get('id')
        filtered = Teacher.objects.filter(id=id)
        if len(filtered) > 0:
            teacher = filtered[0]
            groups = []
            for group in teacher.groups.all():
                groups.append(group.name)
            data = {
                'id': teacher.id,
                'username': teacher.username,
                'first_name': teacher.first_name,
                'last_name': teacher.last_name,
                'password': teacher.password,
                'groups': groups,
            }
            return HttpResponse(json.dumps(data), content_type='application/json; charset=utf-8')
    return HttpResponse('None')


def api_teacher_get_all(request):
    data = []
    for teacher in Teacher.objects.all():
        groups = []
        for group in teacher.groups.all():
            groups.append(group.name)
        data.append({
            'id': teacher.id,
            'username': teacher.username,
            'first_name': teacher.first_name,
            'last_name': teacher.last_name,
            'groups': groups,
        })
    return HttpResponse(json.dumps(data), content_type='application/json; charset=utf-8')


def api_teacher_change(request):
    if request.is_ajax() and request.method == 'POST':
        encoding = request.encoding
        data = json.loads(request.read().decode(encoding))
        # data = json.loads(request.body.decode('latin-1'), encoding="utf-8")
        teacher = Teacher.objects.filter(id=data['id'])
        if (len(teacher) > 0):
            # print(data['last_name'])
            teacher.update(username=data['username'], first_name=data['first_name'], last_name=data['last_name'],
                           password=data['password'])
            groups = []
            teacher = teacher[0]
            for group in teacher.groups.all():
                groups.append(group.name)
            for group_name in data['groups']:
                if group_name not in groups:
                    teacher.groups.add(Group.objects.filter(name=group_name)[0])
            for group_name in groups:
                if group_name not in data['groups']:
                    teacher.groups.remove(Group.objects.filter(name=group_name)[0])

            return HttpResponse("Ok")
        else:
            return HttpResponse("None")
    return HttpResponse("Forbidden")


def api_teacher_add(request):
    json_data = request.PUT
    data = json.loads(json_data)
    pass

def api_group_get_wrapper(group):
    pass

def api_group_get(request):
    if request.is_ajax() and request.method == 'GET':
        group = None
        if(request.GET.get('id') != None):
            group = Group.objects.filter(id=request.GET.get('id'))
            if len(group) > 0:
                group = group[0]
        elif(request.GET.get('name') != None):
            group = Group.objects.filter(name=request.GET.get('name'))
            if len(group) > 0:
                group = group[0]
        if group == None:
            return HttpResponse("None")
        data = {
            'id': group.id,
            'name': group.name,
        }
        return HttpResponse(json.dumps(data), content_type='application/json; charset=utf-8')
    return HttpResponse("Forbidden")

def api_group_get_all(request):
    if request.is_ajax() and request.method == 'GET':
        data = []
        for group in Group.objects.all():
            # activities = []
            # for group in teacher.groups.all():
            #     groups.append(group.name)
            data.append({
                'id': group.id,
                'name': group.name,
            })
        return HttpResponse(json.dumps(data), content_type='application/json; charset=utf-8')
    return HttpResponse("Forbidden")