import sharp from 'sharp';
// Match the previously approved CSS crop, with a small high-DPI derivative.
await sharp('public/images/graduation.png').rotate()
  .extract({ left: 280, top: 130, width: 440, height: 440 })
  .resize(192, 192).webp({ quality: 85 }).toFile('public/images/avatar.webp');
