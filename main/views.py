from django.http import HttpResponse
from django.shortcuts import render


def index(request):
    """ Exemple de page HTML, non valide pour que l'exemple soit concis """
    text = "toto"
    return HttpResponse(text)
