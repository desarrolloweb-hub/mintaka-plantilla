# Mintaka Plantilla

Plantilla web estática (HTML, CSS y JavaScript) basada en el tema **Exolax – Creative Agency**.
No requiere proceso de compilación: se sirve directamente como sitio estático.

## Estructura

```
.
├── buyer-file/        # Sitio web (archivo de entrega)
│   ├── index.html     # Página principal
│   ├── *.html         # Páginas (about, contact, service, news, etc.)
│   ├── contact.php    # Procesamiento del formulario de contacto (requiere PHP)
│   └── assets/        # css, js, img, scss, webfonts
└── documentation/     # Documentación de la plantilla
```

## Cómo ejecutar localmente

Al ser un sitio estático basta con servir la carpeta `buyer-file/` con cualquier servidor HTTP:

```bash
cd buyer-file
python3 -m http.server 8000
```

Luego abre <http://localhost:8000/index.html> en el navegador.

> El formulario de contacto (`contact.php`) requiere un servidor con PHP para enviar correos.
> Para previsualizar solo el diseño no es necesario.

## Variantes de inicio incluidas

`index.html`, `index-2.html` … `index-5.html` y sus versiones `*-dark.html`.
