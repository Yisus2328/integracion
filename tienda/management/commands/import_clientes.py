from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from tienda.models import Cliente 
from django.db import transaction
from django.contrib.auth.hashers import make_password 
class Command(BaseCommand):
    help = 'Importa clientes existentes de la tabla CLIENTE a usuarios de Django.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Iniciando importación de clientes...'))

        try:
            with transaction.atomic():
                clientes = Cliente.objects.all()
                imported_count = 0
                updated_count = 0

                for cliente in clientes:
                    
                    username = cliente.email 
                    if not username:
                        self.stdout.write(self.style.WARNING(f'Saltando cliente con RUT {cliente.rut}: Email no proporcionado.'))
                        continue

                    
                    try:
                        user = User.objects.get(username=username)
                        self.stdout.write(self.style.NOTICE(f'Usuario Django existente para {username}. Actualizando contraseña y email si es necesario.'))
                        updated_count += 1
                    except User.DoesNotExist:
                        user = User(username=username)
                        self.stdout.write(self.style.SUCCESS(f'Creando nuevo usuario Django para {username}.'))
                        imported_count += 1

                    
                    user.email = cliente.email


                    user.set_password(cliente.contraseña) 
                    user.save()

                    
                    cliente.user = user
                    cliente.save()

                self.stdout.write(self.style.SUCCESS(f'Importación completada. Clientes importados: {imported_count}, Clientes actualizados: {updated_count}'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Ocurrió un error durante la importación: {e}'))