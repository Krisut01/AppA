from django.shortcuts import render

def index(request):
    return render(request, 'AppA/index.html')  # Include the app name in the template path
