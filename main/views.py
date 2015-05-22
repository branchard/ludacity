from django.http import HttpResponse
from django.shortcuts import render


def index(request):
    return render(request, 'auth.html')

def auth(request):
    if request.method == "POST":
        pass
    return HttpResponse('toto')