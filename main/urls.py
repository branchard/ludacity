from django.conf.urls import patterns, url

urlpatterns = patterns('main.views',
                       url(r'^$', 'index'),
                       url(r'^disconnect$', 'disconnect'),
                       url(r'^teacher-management$', 'teacher_management'),

                       # Json API
                       url(r'^api/teacher/get$', 'api_teacher_get'),
                       url(r'^api/teacher/get-all$', 'api_teacher_get_all'),
                       url(r'^api/teacher/change$', 'api_teacher_change'),

                       )
