# Generated by Django 5.1.6 on 2025-03-19 03:56

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Account', '0009_alter_customuser_first_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='review',
            name='comment',
        ),
        migrations.RemoveField(
            model_name='review',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='review',
            name='is_approved',
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('comment', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_approved', models.BooleanField(default=False)),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Account.room')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
