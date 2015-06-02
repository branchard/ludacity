from django.conf.urls import patterns, url

urlpatterns = patterns('main.views',
                       url(r'^$', 'index'),
                       url(r'^disconnect$', 'disconnect'),

                       # Admin
                       url(r'^admin/teacher-management$', 'admin_teacher_management'),
                       url(r'^admin/student-management$', 'admin_student_management'),
                       url(r'^admin/group-management$', 'admin_group_management'),

                       # Teacher
                       url(r'^teacher/activity-list$', 'teacher_activity_list'),
                       url(r'^teacher/student-management$', 'teacher_student_management'),
                       url(r'^teacher/edit-activity/([A-Za-z0-9]+)$', 'teacher_edit_activity'),

                       # Student

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
                       url(r'^api/group/change$', 'api_group_change'),
                       url(r'^api/group/add$', 'api_group_add'),
                       url(r'^api/group/delete', 'api_group_delete'),

                       # Activity
                       url(r'^api/activity/get-all$', 'api_activity_get_all'),
                       url(r'^api/activity/add$', 'api_activity_add'),

                       )
