from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views import generic

class IndexView(generic.View):
    template_name = 'main/index.html'

    def get_queryset(self):
        return "toto"
