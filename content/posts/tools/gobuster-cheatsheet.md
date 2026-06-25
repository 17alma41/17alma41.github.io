# Gobuster Cheatsheet

Guía rápida para la enumeración de **directorios**, **subdominios** y **virtual hosts** con Gobuster.

---

##  1. Modos de Operación

Gobuster no solo busca carpetas; funciona por **modos** según el objetivo.

| Modo   | Comando            | ¿Para qué sirve? |
|------|-------------------|------------------|
| dir   | `gobuster dir`    | El más usado. Busca directorios y archivos en un servidor web. |
| dns   | `gobuster dns`    | Busca subdominios (ej. `dev.google.com`) mediante fuerza bruta. |
| vhost | `gobuster vhost`  | Busca Virtual Hosts (útil cuando varias webs comparten la misma IP). |

---

##  2. Parámetros Globales (Comunes)

Estos parámetros funcionan en casi todos los modos.

| Parámetro | Nombre | ¿Para qué sirve? |
|---------|------|------------------|
| `-u` | URL / Domain | Objetivo (ej. `http://10.129.1.1` o `google.com`). |
| `-w` | Wordlist | Ruta al diccionario (ej. `/usr/share/wordlists/dirb/common.txt`). |
| `-t` | Threads | Número de conexiones simultáneas (por defecto 10). Un T4/T5 de Nmap sería ~50–100. |
| `-z` | No Progress | Oculta la barra de progreso (útil si la terminal se satura). |
| `-v` | Verbose | Muestra todos los intentos, incluso los fallidos. |

---

## 3. Enumeración Web (`dir`)

Parámetros específicos para encontrar **archivos y carpetas ocultas**.

| Parámetro | Nombre | ¿Para qué sirve? |
|---------|------|------------------|
| `-x` | Extensions | Busca archivos con extensiones específicas (ej. `-x php,txt,html`). |
| `-s` | Status Codes | Muestra solo ciertos códigos (ej. `-s "200,204,301"`). |
| `-b` | Blacklist | Oculta códigos molestos (ej. `-b "404,403"`). |
| `-k` | Insecure | Salta la verificación SSL (útil con HTTPS mal configurado). |
| `-a` | User Agent | Cambia el User-Agent para evitar protecciones básicas. |

---

## 4. Enumeración DNS y VHosts

Cuando el objetivo es un **dominio**, no solo una web.

| Parámetro | Nombre | ¿Para qué sirve? |
|---------|------|------------------|
| `-d` | Domain | En modo `dns`, indica el dominio padre. |
| `-i` | Show IP | Muestra la IP asociada a cada subdominio encontrado. |
| `--append-domain` | Append | Añade automáticamente el dominio a cada palabra del diccionario. |

---

## 5. Salida de Datos

Guarda resultados para informes o análisis posterior.

| Parámetro | Nombre | ¿Para qué sirve? |
|---------|------|------------------|
| `-o` | Output | Guarda el resultado en un archivo (ej. `-o resultados.txt`). |
| `--no-error` | No Errors | Oculta errores de conexión en pantalla. |

---

## Ejemplos Prácticos

###  Escaneo Web Estándar (CTFs)

Comando ideal para empezar en cualquier máquina web:

```bash
gobuster dir -u http://<IP> \
-w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
-t 50
```

###  Búsqueda de Archivos Sensibles

Para encontrar copias de seguridad, configs o scripts olvidados:

```bash
gobuster dir -u http://<IP> \
-w /usr/share/wordlists/dirb/common.txt \
-x php,txt,bak,zip,config \
-t 30
```

### Fuerza Bruta de Subdominios

Muy útil en fases de reconocimiento inicial:

```bash
gobuster dns -d objetivo.com \
-w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```