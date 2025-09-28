# Ícones PWA

Este diretório deve conter os ícones do app em diferentes tamanhos para PWA.

## Tamanhos necessários:
- icon-72x72.png
- icon-96x96.png  
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Como gerar os ícones:

1. Use o arquivo `icon.svg` na raiz do projeto como base
2. Converta para PNG nos tamanhos necessários usando uma ferramenta como:
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [PWA Builder](https://www.pwabuilder.com/)
   - ImageMagick: `convert icon.svg -resize 192x192 icons/icon-192x192.png`

## Temporário:
Os ícones estão referenciados no manifest.json mas não foram criados ainda.
O app funcionará normalmente, apenas não terá ícones personalizados quando instalado.
