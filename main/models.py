from django.db import models
from polymorphic import PolymorphicModel

# Doc: http://www.apidev.fr/blog/2012/01/12/heritage-de-modele-avec-django/

class User(PolymorphicModel):
    username = models.CharField(max_length=255)
    lastname = models.CharField(max_length=255)
    firstname = models.CharField(max_length=255)

    def __str__(self):
        return "{0} ({1} {2})".format(self.username, self.lastname, self.firstname)


class Admin(User):
    pass


class Teacher(User):
    pass


class Group(models.Model):
    group_name = models.CharField(max_length=255)

    def __str__(self):
        return self.group_name


class Student(User):
    group = models.ForeignKey(Group)

    def __str__(self):
        return "{0} ({1})".format(super(Student, self).__str__(), self.group)


class Exercise(models.Model):
    exercise_name = models.CharField(max_length=255)

    def __str__(self):
        return self.exercise_name

# class Perform(models.Model):
#     score = models.IntegerField(null=False)
#     date = models.DateTimeField()
#     exercise = models.ForeignKey(Exercise)
#     student = models.ForeignKey(Student)
#
#     def __str__(self):
#         return "{0} {1} ({2}): {3}".format(self.student, self.exercise, self.date, self.score)


# class Teach(models.Model):
#     teacher = models.ForeignKey(Teacher)
#     group = models.ForeignKey(Group)
#
#     def __str__(self):
#         return "{0} {1}".format(self.teacher, self.group)


# class Destined(models.Model):
#     exercise = models.ForeignKey(Exercise)
#     group = models.ForeignKey(Group)
#
#     def __str__(self):
#         return "{0} {1}".format(self.exercise, self.group)
