from django.conf.urls import patterns, url

urlpatterns = patterns('main.views',
                       url(r'^$', 'index'),
                       url(r'^disconnect$', 'disconnect'),
                       url(r'^teacher-management$', 'teacher_management'),
                       url(r'^student-management$', 'student_management'),
                       url(r'^group-management$', 'group_management'),

                       # Json API
                       # Teacher
                       url(r'^api/teacher/get$', 'api_teacher_get'),
                       url(r'^api/teacher/get-all$', 'api_teacher_get_all'),
                       url(r'^api/teacher/change$', 'api_teacher_change'),
                       url(r'^api/teacher/add$', 'api_teacher_add'),
                       url(r'^api/teacher/delete$', 'api_teacher_delete'),

                       # Student
                       url(r'^api/student/get$', 'api_student_get'),
                       url(r'^api/student/get-all$', 'api_student_get_all'),
                       url(r'^api/student/change$', 'api_student_change'),
                       url(r'^api/student/add$', 'api_student_add'),
                       url(r'^api/student/delete$', 'api_student_delete'),
                       
                       # Group
                       url(r'^api/group/get$', 'api_group_get'),
                       url(r'^api/group/get-all$', 'api_group_get_all'),

                       )
