from django.db import models
from polymorphic import PolymorphicModel

# Doc: http://www.apidev.fr/blog/2012/01/12/heritage-de-modele-avec-django/

class User(PolymorphicModel):
    username = models.CharField(primary_key=True, max_length=255)
    lastname = models.CharField(max_length=255)
    firstname = models.CharField(max_length=255)

    def __str__(self):
        return "{0} ({1} {2})".format(self.username, self.lastname, self.firstname)


class Admin(User):
    pass


class Teacher(User):
    groups = models.ManyToManyField('Group', blank=True, null=True)

    def __str__(self):
        return "{0} ({1})".format(super(Teacher, self).__str__(), self.groups)


class Student(User):
    group = models.ForeignKey('Group', null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return "{0} ({1})".format(super(Student, self).__str__(), self.group)


class Group(models.Model):
    name = models.CharField(primary_key=True, max_length=255)
    exercises = models.ManyToManyField('Exercise', blank=True, null=True)

    def __str__(self):
        return self.name


class Activity(models.Model):  # Une activité est composée de plusieurs exercices
    title = models.CharField(primary_key=True, max_length=255)
    date = models.DateTimeField(auto_now=True)
    multi_attempts = models.BooleanField()  # tentatives multiples ?
    interactive_correction = models.BooleanField()  # correction interactive ? utile en materelle

    teacher = models.ForeignKey('Teacher')

    def __str__(self):
        return "{0} ({1})".format(self.title, self.date)


class Exercise(models.Model):
    order_json = models.TextField() # Consigne
    exercise_json = models.TextField() #TODO
    activity = models.ForeignKey('Activity')


class CorrectionElement(models.Model):
    index = models.IntegerField()
    content = models.TextField()
    exercise = models.ForeignKey('Exercise')


class Reply(models.Model):
    date = models.DateTimeField(auto_now=True)

    exercise = models.ForeignKey('Exercise', null=True, blank=True, on_delete=models.SET_NULL)# un exercice peut etre supprimé, du coup il faut stocker le score
    student = models.ForeignKey('Student')

    index = models.IntegerField()
    content = models.TextField()



    def __str__(self):
        return "{0} {1} ({2})".format(self.student, self.exercise, self.date)