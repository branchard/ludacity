from django.db import models

# Create your models here.

class User(models.Model):
    username = models.CharField(max_length=255)
    lastname = models.CharField(max_length=255)
    firstname = models.CharField(max_length=255)

class Admin(User):
    pass

class Teacher(User):
    pass

class Student(User):
    group = models.ForeignKey(Group)

class Group(models.Model):
    group_name = models.CharField(max_length=255)

class Exercise(models.Model):
    exercise_name = models.CharField(max_length=255)