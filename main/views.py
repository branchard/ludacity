from django.http import HttpResponse
from django.shortcuts import render


def index(request):
    bad_password = request.session['bad_password']
    return render(request, 'auth.html')

def auth(request):

    if request.method == "POST":
        pass
    return HttpResponse('toto')