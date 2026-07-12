# Mejora de idea: Forky — "control de versiones para menús de restaurante"

> Análisis y propuesta de mejora sobre la idea publicada en r/cuu (forky.rest),
> lanzada en Product Hunt: software de control de versiones para que operaciones
> autorice cambios de menú, diseño ejecute sobre seguro y el restaurante deje de
> perder dinero por errores humanos.

---

## 1. Resumen ejecutivo

La idea ataca un dolor real y bien narrado (el precio equivocado en el QR que
costó miles de pesos), pero está enmarcada con una metáfora de desarrollador
("Git para menús") que el cliente no compra, y el control de versiones sobre
*archivos* resuelve solo la mitad del problema. La mejora central propuesta:

**Dejar de versionar archivos y versionar el menú como datos estructurados,
con flujo de aprobación y publicación automática a todos los canales.**

El PDF, el QR, la página web, Uber Eats/Rappi/DiDi Food y las pantallas del
local dejan de ser "archivos que alguien sube" y pasan a ser *salidas
generadas* de una sola fuente de verdad. Eso convierte el producto de un
"nice-to-have" (orden en los borradores) en un "must-have" operativo (cambias
un precio una vez y se publica en todos lados, con auditoría y rollback).

---

## 2. Qué está fuerte de la idea original

- **El dolor es real y frecuente.** Con la inflación de insumos, los precios
  cambian cada pocas semanas; cada cambio hoy pasa por WhatsApp, 20 borradores
  y un diseñador que edita el archivo equivocado.
- **La anécdota vende.** "Un error de dedo costó miles de pesos en una tarde"
  es un pitch de pérdida evitada, no de productividad — mucho más fácil de
  cobrar.
- **Identificó a los actores correctos:** chef (propone), operaciones
  (aprueba), diseño (ejecuta), marketing (publica). El producto correcto es un
  workflow entre esos cuatro, no una herramienta de diseño más.
- **Las agencias de marketing como usuario secundario** es una intuición
  valiosa (ver §5: conviene convertirlas en canal de distribución).

## 3. Debilidades del planteamiento actual

1. **La metáfora "Git para menús" es para desarrolladores, no para
   restauranteros.** El dueño de un restaurante no sabe qué es control de
   versiones ni le importa; compra "nunca más un precio equivocado" y "cambias
   el precio en un lugar y se actualiza en todos lados". El mecanismo no es el
   producto; el resultado sí.
2. **Versionar archivos (PDF) no cierra el ciclo.** Aunque el PDF aprobado sea
   el correcto, alguien todavía tiene que subirlo al QR, a la web, a las
   plataformas de delivery y mandarlo a imprenta. El "teléfono descompuesto"
   sigue vivo aguas abajo de la aprobación.
3. **Lanzar "completamente gratis" sin precio publicado** consigue feedback
   pero cero señal de disposición a pagar. El riesgo clásico: 200 registros,
   0 clientes.
4. **Product Hunt es la audiencia equivocada** para vender a restaurantes de
   Chihuahua: ahí hay desarrolladores y early adopters de SaaS, no gerentes de
   operaciones de restaurantes mexicanos.
5. **El QR-menú es un mercado saturado.** Hay decenas de SaaS de "menú QR". Si
   Forky se percibe como uno más, muere en la comparación de precios. Su
   diferencia (workflow de aprobación + auditoría + multi-canal) tiene que ser
   el centro del posicionamiento.

## 4. Mejoras de producto (en orden de impacto)

### 4.1 El menú como base de datos, no como archivo
Modelar platillos, precios, modificadores, secciones, disponibilidad y
sucursales como datos. Cada canal es un "destino de publicación":

- **QR permanente:** el código impreso en las mesas nunca cambia; siempre
  apunta a la última versión *publicada*. Rollback instantáneo — la ventana de
  pérdida del caso "precio equivocado" se reduce de una tarde a un minuto.
- **PDF/imprenta generados** con plantillas (el diseñador diseña la plantilla
  una vez; los datos fluyen solos).
- **Sincronización con delivery** (Uber Eats, Rappi, DiDi Food tienen APIs de
  menú) y con Google Business Profile. Este es el candado (moat): nadie que
  sincroniza sus 4 canales desde Forky se va después.

### 4.2 Flujo de aprobación donde ya vive el caos: WhatsApp
El detalle "hay 20 borradores en el WhatsApp" es el insight más valioso del
post. No hay que sacar a la gente de WhatsApp; hay que meter la aprobación ahí:
el chef propone el cambio desde su teléfono, operaciones recibe un mensaje de
WhatsApp con el diff ("Arrachera: $285 → $310") y botones Aprobar/Rechazar.
Nada se publica sin aprobación. Cero curva de aprendizaje para el aprobador.

### 4.3 Auditoría y "diff humano"
Historial de quién cambió qué, cuándo y quién lo aprobó — mostrado como
"precio de la arrachera cambió de $285 a $310, aprobado por Karla el 3 de
julio", nunca como commits. Esto es exactamente lo que faltó en la anécdota
del cliente que exigió el precio del QR.

### 4.4 Inteligencia de márgenes (diferenciador a mediano plazo)
Si el chef captura costos, Forky puede sugerir el precio según el margen
objetivo y alertar cuando la inflación de un insumo deja un platillo por
debajo del margen mínimo. Con esto el producto deja de ser "administración"
y se vuelve una herramienta de rentabilidad — otra categoría de precio.

### 4.5 Multi-sucursal y multi-idioma
Precios por sucursal con herencia del menú base (cadenas locales tipo 3–10
sucursales son el cliente ideal: suficiente caos, suficiente presupuesto), y
versión bilingüe ES/EN generada del mismo dato (útil en ciudades turísticas y
fronterizas).

## 5. Modelo de negocio propuesto

- **Free:** 1 sucursal, 1 menú, QR + web. Suficiente para engancharse, no para
  operar en serio.
- **Pro (~MX$399–499/sucursal/mes):** flujo de aprobación, WhatsApp, PDF de
  imprenta, historial completo, rollback.
- **Sync (~MX$799+/sucursal/mes):** sincronización con delivery y Google,
  multi-sucursal, márgenes.
- **Plan Agencia:** las agencias de marketing administran menús de N clientes
  desde un panel, con marca blanca. Esto las convierte de competidor implícito
  ("el diseñador pierde chamba") en canal de distribución que trae 10–30
  restaurantes por agencia.

Cobrar desde ahora aunque haya descuento de lanzamiento ("gratis 3 meses para
los primeros 20 restaurantes de CUU **con tarjeta registrada**") — la señal de
pago es la única validación que cuenta.

## 6. Go-to-market corregido

1. **Local primero, no Product Hunt.** PH sirve para el backlink y el ego; los
   clientes están a 15 minutos en coche. Meta: 10 restaurantes de Chihuahua
   como design partners en 60 días, visitándolos en persona.
2. **CANIRAC Chihuahua y grupos restauranteros** como puerta de entrada
   institucional; una plática de "cuánto pierde un restaurante por errores de
   menú" abre más puertas que anuncios.
3. **2–3 agencias locales con plan agencia** (cada una multiplica).
4. **Caso de estudio con números** ("X restaurante redujo a cero los errores
   de precio y actualiza sus 4 canales en 5 minutos") antes de expandir a
   otras ciudades del norte y luego LatAm.
5. **Integración con POS mexicano** (SoftRestaurant es el estándar de facto)
   cuando haya tracción: es la barrera de salida definitiva.

## 7. Riesgos principales

| Riesgo | Mitigación |
|---|---|
| Percepción de "otro menú QR más" | Posicionar el workflow de aprobación y la sincronización multi-canal, nunca el QR |
| APIs de delivery cambian o restringen acceso | Empezar por QR/PDF/web (100% propio) y agregar delivery como plan superior |
| Restaurantes pequeños no pagan SaaS | Apuntar a 3–10 sucursales y a agencias, no al changarro de una sola persona |
| El gratis atrae curiosos, no clientes | Tarjeta registrada desde el inicio, precio publicado |

## 8. Secuencia recomendada (90 días)

1. **Semanas 1–4:** menú estructurado + QR permanente + aprobación simple +
   historial legible. Cobrar desde el día 1 con descuento de lanzamiento.
2. **Semanas 5–8:** aprobación por WhatsApp + PDF de imprenta con plantillas.
   10 design partners locales operando.
3. **Semanas 9–12:** multi-sucursal + primer sync (Google Business es el más
   fácil), caso de estudio publicado, plan agencia con 2 agencias.

---

**Idea en una línea (versión mejorada):**
*"Cambia un precio una vez, apruébalo por WhatsApp y se actualiza en tu QR, tu
web, tus PDFs y tus apps de delivery al mismo tiempo — con historial de quién
aprobó qué y rollback instantáneo."*
