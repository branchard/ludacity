# -*- coding:utf-8 -*-
from django.http import HttpResponseRedirect
from django.shortcuts import render
from main.utils import *
from main.models import *
import json

# Decorators
def restrict_users_to(*usersType):
    '''
    Decorator who restrict wrapped func to parms users
    :param *usersType: User(s) type form main.models
    :return: decorator
    '''

    def decorator(func):
        def wrapper(*args, **kwargs):
            request = args[0]
            request_user_type = type(request.user)
            allowed = False
            for user_type in usersType:
                allowed = request_user_type == user_type
                if allowed:
                    break

            if (allowed):
                return func(*args, **kwargs)
            return HttpResponse("Forbidden")

        return wrapper

    return decorator


def restrict_ajax_http_request_to(requestTypeName):
    '''
    Decorator who restrict wrapped func to parms request type
    :param requestTypeName: 'GET', 'POST', 'PUT', 'DELETE'
    :return: decorator
    '''

    def decorator(func):
        def wrapper(*args, **kwargs):
            request = args[0]
            if request.is_ajax() and request.method == requestTypeName.upper():
                return func(*args, **kwargs)
            return HttpResponse("Forbidden")

        return wrapper

    return decorator


# Views

# Global views
def index(request):
    # Index dispatcher
    if request.user != None:
        if (type(request.user) == Admin):
            return render(request, 'admin/index.html')
        elif (type(request.user) == Teacher):
            return render(request, 'teacher/index.html')
        elif (type(request.user) == Student):
            return render(request, 'student/index.html')
        return render(request, 'index.html')
    else:
        return render(request, 'auth.html')


def disconnect(request):
    request.session.flush()
    return HttpResponseRedirect('/')


# Admin views

def admin_teacher_management(request):
    context_data = dict()
    context_data['active_menu_item'] = 1
    return render(request, 'admin/teacher_management.html', context_data)


def admin_student_management(request):
    context_data = dict()
    context_data['active_menu_item'] = 2
    return render(request, 'admin/student_management.html', context_data)


def admin_group_management(request):
    context_data = dict()
    context_data['active_menu_item'] = 3
    return render(request, 'admin/group_management.html', context_data)


# Teacher views

def teacher_activity_list(request):
    context_data = dict()
    context_data['active_menu_item'] = 1
    return render(request, 'teacher/activity-list.html', context_data)


# il faut regrouper les élèves par classe
def teacher_student_management(request):
    pass


def teacher_edit_activity(request, activity_index):
    context_data = dict()
    context_data['active_menu_item'] = 1

    teacher = request.user

    if activity_index == 'latest':
        activity = teacher.activity_set.latest('date')
    elif activity_index == 'new':
        pass
    elif activity_index.isdigit():
        context_data['activity_id'] = activity_index
    return render(request, 'teacher/edit-activity.html', context_data)


# JSON api

# Teacher
@restrict_users_to(Admin)
@restrict_ajax_http_request_to('GET')
def api_teacher_get(request):
    if request.GET.get('id') != None:
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


@restrict_users_to(Admin)
@restrict_ajax_http_request_to('GET')
def api_teacher_get_all(request):
    data = []
    for teacher in Teacher.objects.all().order_by('id'):
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


@restrict_users_to(Admin)
@restrict_ajax_http_request_to('POST')
def api_teacher_change(request):
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


@restrict_users_to(Admin)
@restrict_ajax_http_request_to('PUT')
def api_teacher_add(request):
    encoding = request.encoding
    data = json.loads(request.read().decode(encoding))
    teacher = Teacher(username=data['username'], first_name=data['first_name'], last_name=data['last_name'],
                      password=data['password'])
    teacher.save()
    for group_name in data['groups']:
        teacher.groups.add(Group.objects.filter(name=group_name)[0])
    return HttpResponse("Ok")


@restrict_users_to(Admin)
@restrict_ajax_http_request_to('DELETE')
def api_teacher_delete(request):
    encoding = request.encoding
    data = json.loads(request.read().decode(encoding))
    Teacher.objects.filter(id=data['id']).delete()
    return HttpResponse("Ok")


# Student
@restrict_users_to(Admin)
@restrict_ajax_http_request_to('GET')
def api_student_get(request):
    if request.GET.get('id') != None:
        id = request.GET.get('id')
        filtered = Student.objects.filter(id=id)
        if len(filtered) > 0:
            student = filtered[0]
            groups = []
            if student.group != None:
                groups.append(student.group.name)
            data = {
                'id': student.id,
                'username': student.username,
                'first_name': student.first_name,
                'last_name': student.last_name,
                'password': student.password,
                'groups': groups,
            }
            return HttpResponse(json.dumps(data), content_type='application/json; charset=utf-8')
    return HttpResponse('None')


@restrict_users_to(Admin)
@restrict_ajax_http_request_to('GET')
def api_student_get_all(request):
    data = []
    for student in Student.objects.all().order_by('id'):
        groups = []
        if student.group != None:
            groups.append(student.group.name)
        data.append({
            'id': student.id,
            'username': student.username,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'groups': groups,
        })
    return HttpResponse(json.dumps(data), content_type='application/json; charset=utf-8')


@restrict_users_to(Admin)
@restrict_ajax_http_request_to('POST')
def api_student_change(request):
    encoding = request.encoding
    data = json.loads(request.read().decode(encoding))
    student = Student.objects.filter(id=data['id'])
    if (len(student) > 0):
        student.update(username=data['username'], first_name=data['first_name'], last_name=data['last_name'],
                       password=data['password'],
                       group=None if len(data['groups']) == 0 else Group.objects.filter(name=data['groups'][0])[
                           0])
        return HttpResponse("Ok")
    else:
        return HttpResponse("None")


@restrict_users_to(Admin)
@restrict_ajax_http_request_to('PUT')
def api_student_add(request):
    encoding = request.encoding
    data = json.loads(request.read().decode(encoding))
    Student(username=data['username'], first_name=data['first_name'], last_name=data['last_name'],
            password=data['password'],
            group=None if len(data['groups']) == 0 else Group.objects.filter(name=data['groups'][0])[0]).save()
    return HttpResponse("Ok")


@restrict_users_to(Admin)
@restrict_ajax_http_request_to('DELETE')
def api_student_delete(request):
    encoding = request.encoding
    data = json.loads(request.read().decode(encoding))
    Student.objects.filter(id=data['id']).delete()
    return HttpResponse("Ok")


# Group
@restrict_users_to(Admin)
@restrict_ajax_http_request_to('GET')
def api_group_get(request):
    group = None
    if (request.GET.get('id') != None):
        group = Group.objects.filter(id=request.GET.get('id'))
        if len(group) > 0:
            group = group[0]
    elif (request.GET.get('name') != None):
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


@restrict_users_to(Admin, Teacher)
@restrict_ajax_http_request_to('GET')
def api_group_get_all(request):
    groups = None
    if (type(request.user) == Teacher):
        groups = request.user.groups.all()
    elif (type(request.user) == Admin):
        groups = Group.objects.all()
    data = []
    for group in groups.order_by('id'):
        data.append({
            'id': group.id,
            'name': group.name,
        })
    return HttpResponse(json.dumps(data), content_type='application/json; charset=utf-8')


@restrict_users_to(Admin)
@restrict_ajax_http_request_to('POST')
def api_group_change(request):
    encoding = request.encoding
    data = json.loads(request.read().decode(encoding))

    group = Group.objects.filter(id=data['id'])
    if (len(group) > 0):
        group.update(name=data['name'])
        return HttpResponse("Ok")
    else:
        return HttpResponse("None")


@restrict_users_to(Admin)
@restrict_ajax_http_request_to('PUT')
def api_group_add(request):
    encoding = request.encoding
    data = json.loads(request.read().decode(encoding))
    Group(name=data['name']).save()
    return HttpResponse("Ok")


@restrict_users_to(Admin)
@restrict_ajax_http_request_to('DELETE')
def api_group_delete(request):
    encoding = request.encoding
    data = json.loads(request.read().decode(encoding))
    Group.objects.filter(id=data['id']).delete()
    return HttpResponse("Ok")


# Activity
@restrict_users_to(Teacher)
@restrict_ajax_http_request_to('GET')
def api_activity_get(request):
    teacher = request.user
    activity = None
    if (request.GET.get('id') != None):
        activity = teacher.activity_set.filter(id=request.GET.get('id'))
    elif (request.GET.get('title') != None):
        activity = teacher.activity_set.filter(title=request.GET.get('title'))
    elif (request.GET.get('latest') != None):
        activity = teacher.activity_set.latest('date')
        activity = [activity] # gros bricolage
    if activity != None and len(activity) > 0:
        activity = activity[0]
    else:
        return HttpResponse("None")

    groups = []
    for group in activity.group_set.all():
        groups.append({'id': group.id, 'name': group.name})

    exercises = []
    for exercise in activity.exercise_set.all():
        exercises.append({'id': exercise.id, 'title': exercise.title, 'type': exercise.type,
                          'exercise_json': exercise.exercise_json})
    data = {
        'id': activity.id,
        'title': activity.title,
        'groups': groups,
        'multi_attempts': activity.multi_attempts,
        'interactive_correction': activity.interactive_correction,
        'exercises': exercises,
    }
    return HttpResponse(json.dumps(data), content_type='application/json; charset=utf-8')


@restrict_users_to(Teacher)
@restrict_ajax_http_request_to('GET')
def api_activity_get_all(request):
    teacher = request.user
    data = []
    for activity in teacher.activity_set.all().order_by('date'):
        groups = []
        for group in activity.group_set.all().order_by('id'):
            groups.append({'name': group.name})
        data.append({
            'id': activity.id,
            'title': activity.title,
            'date': {'year': activity.date.year, 'month': activity.date.month, 'day': activity.date.day,
                     'hour': activity.date.hour, 'minute': activity.date.minute},
            'groups': groups,
        })
    return HttpResponse(json.dumps(data), content_type='application/json; charset=utf-8')


@restrict_users_to(Teacher)
@restrict_ajax_http_request_to('PUT')
def api_activity_add(request):
    data = get_json_from_request(request)
    teacher = request.user

    activity = Activity(title='Nouvelle activité' if data['title'] == '' else data['title'],
                        multi_attempts=data['multi_attempts'],
                        interactive_correction=data['interactive_correction'],
                        )

    teacher.activity_set.add(activity)

    for group in data['groups']:
        Group.objects.filter(name=group)[0].activities.add(activity)

    return HttpResponse("Ok")

@restrict_users_to(Teacher)
@restrict_ajax_http_request_to('POST')
def api_activity_change(request):
    data = get_json_from_request(request)
    teacher = request.user

    # Prevent type error
    if isinstance(data['id'], str) and data['id'].isdigit():
        data['id'] = int(data['id'])

    activity = teacher.activity_set.filter(id=data['id'])
    if (len(activity) > 0):
        activity.update(title=data['title'], multi_attempts=data['multi_attempts'], interactive_correction=data['interactive_correction'])

        groups = []
        activity = activity[0]
        for group in activity.group_set.all():
            groups.append(group)
        for group in data['groups']:
            if group not in groups:
                activity.group_set.add(teacher.groups.filter(name=group['name'])[0])
        for group in groups:
            if group not in data['groups']:
                activity.group_set.remove(teacher.groups.filter(name=group.name)[0])
        activity.save()
        return HttpResponse("Ok")
    else:
        return HttpResponse("Unknown activity")

@restrict_users_to(Teacher)
@restrict_ajax_http_request_to('DELETE')
def api_activity_delete(request):
    encoding = request.encoding
    data = json.loads(request.read().decode(encoding))
    teacher = request.user
    teacher.activity_set.filter(id=data['id']).delete()
    return HttpResponse("Ok")