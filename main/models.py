from django.db import models
from polymorphic import PolymorphicModel

# Doc: http://www.apidev.fr/blog/2012/01/12/heritage-de-modele-avec-django/

class User(PolymorphicModel):
    # PK = id
    username = models.CharField(max_length=255, unique=True)
    first_name = models.CharField(max_length=255)  # Prénom
    last_name = models.CharField(max_length=255)  # Nom de famille
    password = models.CharField(max_length=50)

    def __str__(self):
        return "{0} ({1} {2})".format(self.username, self.last_name, self.first_name)


class Admin(User):
    pass


class Teacher(User):
    groups = models.ManyToManyField('Group', blank=True)

    def __str__(self):
        return "{0} ({1})".format(super(Teacher, self).__str__(), self.groups.all())


class Student(User):
    group = models.ForeignKey('Group', null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return "{0} ({1})".format(super(Student, self).__str__(), self.group)


class Group(models.Model):
    name = models.CharField(max_length=255, unique=True)
    activities = models.ManyToManyField('Activity', blank=True)

    def __str__(self):
        return "{0} ({1})".format(self.name, self.activities.all())


class Activity(models.Model):  # Une activité est composée de plusieurs exercices
    title = models.CharField(max_length=255)  # unique=True ?
    date = models.DateTimeField(auto_now=True)  # last modification date
    multi_attempts = models.BooleanField()  # tentatives multiples ?
    interactive_correction = models.BooleanField()  # correction interactive ? utile en materelle

    teacher = models.ForeignKey('Teacher')

    def __str__(self):
        return "{0} ({1})".format(self.title, self.date)


class Exercise(models.Model):
    # order_json = models.TextField()  # Consigne
    exercise_json = models.TextField()  # TODO
    activity = models.ForeignKey('Activity')


class CorrectionElement(models.Model):
    index = models.IntegerField()
    content = models.TextField()
    exercise = models.ForeignKey('Exercise')


class Reply(models.Model):
    date = models.DateTimeField(auto_now=True)

    exercise = models.ForeignKey('Exercise', null=True, blank=True,
                                 on_delete=models.SET_NULL)  # un exercice peut etre supprimé, du coup il faut stocker le score
    student = models.ForeignKey('Student')

    index = models.IntegerField()
    content = models.TextField()

    def __str__(self):
        return "{0} {1} ({2})".format(self.student, self.exercise, self.date)
