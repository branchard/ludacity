from main.models import *


def context_user_type(request):
    if request.user != None:
        user = request.user

        context_data = dict()

        context_data['first_name'] = user.first_name
        context_data['last_name'] = user.last_name

        context_data['connected'] = True

        context_data['admin_panel'] = type(user) == Admin
        context_data['teacher_panel'] = type(user) == Teacher
        context_data['student_panel'] = type(user) == Student

        return context_data
    else:
        bad_login = request.session.get('bad_login', False)
        if bad_login:
            del request.session['bad_login']
        return {'bad_login': bad_login}
