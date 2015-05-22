from django.db import models
from polymorphic import PolymorphicModel

# Doc: http://www.apidev.fr/blog/2012/01/12/heritage-de-modele-avec-django/

class User(PolymorphicModel):
    username = models.CharField(primary_key=True, max_length=255)
    last_name = models.CharField(max_length=255)
    first_name = models.CharField(max_length=255)
    password = models.CharField(max_length=50)

    ''' Retourne  un entier, 0 si correct, 1 si mots de passes non identiques, 2 si mot de passe trop court '''

    def set_password(self, password, password_check):
        if len(password) < 4:
            return 2  # mot de passe trop court, au moins 4 caractères
        if password != password_check:
            return 1  # mot de passe non identiques
        self.password = password
        return 0  # mot de passe correcte


    ''' Retourne un booleen qui indique si le passw est correct '''
    def check_password(self, password):
        return self.password == password

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
    name = models.CharField(primary_key=True, max_length=255)
    activities = models.ManyToManyField('Activity', blank=True)

    def __str__(self):
        return "{0} ({1})".format(self.name, self.activities.all())


class Activity(models.Model):  # Une activité est composée de plusieurs exercices
    title = models.CharField(primary_key=True, max_length=255)
    date = models.DateTimeField(auto_now=True)
    multi_attempts = models.BooleanField()  # tentatives multiples ?
    interactive_correction = models.BooleanField()  # correction interactive ? utile en materelle

    teacher = models.ForeignKey('Teacher')

    def __str__(self):
        return "{0} ({1})".format(self.title, self.date)


class Exercise(models.Model):
    order_json = models.TextField()  # Consigne
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
