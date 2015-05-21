# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('title', models.CharField(max_length=255, serialize=False, primary_key=True)),
                ('date', models.DateTimeField()),
                ('multi_attempts', models.BooleanField()),
                ('interactive_correction', models.BooleanField()),
            ],
        ),
        migrations.CreateModel(
            name='CorrectionElement',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('index', models.IntegerField()),
                ('content', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Exercise',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('order_json', models.CharField(max_length=10240)),
                ('exercise_json', models.CharField(max_length=1024)),
                ('activity', models.ForeignKey(to='main.Activity')),
            ],
        ),
        migrations.CreateModel(
            name='Group',
            fields=[
                ('name', models.CharField(max_length=255, serialize=False, primary_key=True)),
                ('exercises', models.ManyToManyField(to='main.Exercise', blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Reply',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('date', models.DateTimeField()),
                ('index', models.IntegerField()),
                ('content', models.CharField(max_length=255)),
                ('exercise', models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, blank=True, to='main.Exercise', null=True)),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('username', models.CharField(max_length=255, serialize=False, primary_key=True)),
                ('lastname', models.CharField(max_length=255)),
                ('firstname', models.CharField(max_length=255)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Admin',
            fields=[
                ('user_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='main.User')),
            ],
            options={
                'abstract': False,
            },
            bases=('main.user',),
        ),
        migrations.CreateModel(
            name='Student',
            fields=[
                ('user_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='main.User')),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, blank=True, to='main.Group', null=True)),
            ],
            options={
                'abstract': False,
            },
            bases=('main.user',),
        ),
        migrations.CreateModel(
            name='Teacher',
            fields=[
                ('user_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='main.User')),
                ('groups', models.ManyToManyField(to='main.Group', blank=True)),
            ],
            options={
                'abstract': False,
            },
            bases=('main.user',),
        ),
        migrations.AddField(
            model_name='user',
            name='polymorphic_ctype',
            field=models.ForeignKey(related_name='polymorphic_main.user_set+', editable=False, to='contenttypes.ContentType', null=True),
        ),
        migrations.AddField(
            model_name='correctionelement',
            name='exercise',
            field=models.ForeignKey(to='main.Exercise'),
        ),
        migrations.AddField(
            model_name='reply',
            name='student',
            field=models.ForeignKey(to='main.Student'),
        ),
        migrations.AddField(
            model_name='activity',
            name='teacher',
            field=models.ForeignKey(to='main.Teacher'),
        ),
    ]